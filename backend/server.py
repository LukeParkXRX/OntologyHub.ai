from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import io
import json
from pypdf import PdfReader
from dotenv import load_dotenv

# Internal Imports
# Internal Imports
from parser.extractor import extract_graph_elements, extract_concept_graph
from parser.file_loader import load_file_content
from agent.classifier import classify_and_extract
from parser.ingest import Neo4jIngestor
from parser.web_search import perform_web_search
from analysis.network_stats import enrich_graph_data
from graphrag.retriever import GraphRetriever
from graphrag.answer_gen import generate_answer
from neo4j import GraphDatabase


# Load Env
load_dotenv()

# --- Models ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    context: Optional[str] = None

class IngestRequest(BaseModel):
    text: str

class AuthIngestRequest(BaseModel):
    provider: str
    user_data: Dict[str, Any]

class GraphData(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]

# --- App Initialization ---
app = FastAPI(title="OntologyHub.AI API", version="0.2.1")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, secure this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Neo4j Config ---
URI = os.getenv("NEO4J_URI", "neo4j+ssc://b60a0727.databases.neo4j.io")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

# --- Endpoints ---

@app.get("/graph", response_model=GraphData)
async def get_graph():
    """
    Returns the whole graph for 3D visualization.
    Format is compatible with react-force-graph-3d.
    """
    driver = GraphDatabase.driver(URI, auth=AUTH)
    
    # [ALIVE] Strict Mode: Only fetch nodes explicitly tagged as 'user' identity.
    # This prevents junk/test data from polluting the view.
    query = """
    MATCH (n)
    WHERE n.source = 'user'
    OPTIONAL MATCH (n)-[r]->(m)
    WHERE m.source = 'user'
    RETURN n, r, m
    LIMIT 300
    """
    
    nodes_map = {}
    links = []
    
    try:
        with driver.session() as session:
            result = session.run(query)
            for record in result:
                n = record["n"]
                m = record["m"]
                r = record["r"]
                
                # Nodes (Always process N)
                n_id = n.element_id if hasattr(n, "element_id") else str(n.id)
                n_label = list(n.labels)[0] if n.labels else "Unknown"
                n_props = dict(n)

                if n_id not in nodes_map:
                    nodes_map[n_id] = {
                        "id": n_id, 
                        "label": n_label, 
                        "layer": n.get("layer"), 
                        "name": n.get("name") or n.get("summary") or n.get("topic") or "Unknown",
                        "val": 1,
                        **n_props
                    }
                
                # Process M and R only if they exist
                if m and r is not None:
                    m_id = m.element_id if hasattr(m, "element_id") else str(m.id)
                    m_label = list(m.labels)[0] if m.labels else "Unknown"
                    m_props = dict(m)

                    if m_id not in nodes_map:
                        nodes_map[m_id] = {
                            "id": m_id, 
                            "label": m_label, 
                            "layer": m.get("layer"), 
                            "name": m.get("name") or m.get("summary") or m.get("topic") or "Unknown",
                            "val": 1,
                            **m_props
                        }
                        
                    # Links
                    links.append({
                        "source": n_id,
                        "target": m_id,
                        "name": r.type
                    })
                
                
        # Apply Network Analysis (Centrality & Community)
        raw_nodes = list(nodes_map.values())
        enriched_data = enrich_graph_data(raw_nodes, links)
                
        return GraphData(nodes=enriched_data["nodes"], links=enriched_data["links"])
    except Exception as e:
        print(f"Graph Fetch Error: {e}")
        return GraphData(nodes=[], links=[])
    finally:
        driver.close()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        # [ALIVE] active_interviewer Integration
        from actions.interviewer import GenesisInterviewer
        
        # 1. Check User Context & Stats (Find "Me" node and neighbor counts)
        driver = GraphDatabase.driver(URI, auth=AUTH)
        user_node = None
        graph_stats = {}
        
        with driver.session() as session:
            # Fetch User Node and all connected neighbor labels
            query = """
            MATCH (n:Person {source: 'user'})
            OPTIONAL MATCH (n)-[]-(m)
            RETURN n, collect(labels(m)) as neighbor_labels
            LIMIT 1
            """
            result = session.run(query)
            record = result.single()
            
            if record:
                user_node = dict(record["n"])
                # Aggregate Stats (e.g., {'Event': 5, 'Skill': 2})
                all_labels = [lbl for sublist in record["neighbor_labels"] for lbl in sublist]
                for lbl in all_labels:
                    graph_stats[lbl] = graph_stats.get(lbl, 0) + 1
        driver.close()

        # 2. Determine Next Question (Genesis Logic)
        interviewer = GenesisInterviewer()
        # If the user message is short/greeting, or if we want to force genesis flow:
        # We can implement a more complex router. For now, if "User Node" is weak, override.
        
        next_q = interviewer.determine_next_question(user_node, graph_stats)
        
        # Simple Logic: If user is just answering or starting, and we have a burning question, pre-pend it or just return it?
        # Let's combine Retrieval + Active Question.
        
        # [ALIVE] Auto-Ingestion (Active Learning)
        # Extract and save knowledge from user's message immediately
        try:
            print(f"Auto-Ingesting Chat: {req.message}")
            extracted_data = extract_graph_elements(req.message)
            
            if extracted_data.get("nodes"):
                # Inject Identity Tags
                for node in extracted_data["nodes"]:
                    if "properties" not in node: node["properties"] = {}
                    node["properties"]["source"] = "user"
                    node["properties"]["layer"] = node.get("layer", "Semantic")
                
                # Ingest to DB
                ingestor = Neo4jIngestor()
                ingestor.ingest_batch(extracted_data)
                ingestor.close()
                print("Auto-Ingestion Complete.")
        except Exception as ingest_err:
            print(f"Auto-Ingest Warning: {ingest_err}")

        retriever = GraphRetriever()
        context = retriever.retrieve(req.message)
        retriever.close()
        
        # If context is empty and we are in genesis phase, just ask the question.
        if not context and next_q:
             return ChatResponse(answer=next_q, context="Genesis Mode: Initializing Identity")

        answer = generate_answer(req.message, context)
        
        # Post-pend the active question to keep the flow moving
        if next_q:
            answer += f"\n\n(Interviewer): {next_q}"

        return ChatResponse(answer=answer, context=context)
    except Exception as e:
        print(f"Chat Error: {e}")
        # Build a safe fallback response
        return ChatResponse(answer="I am listening. Tell me more about yourself.", context="Error Fallback")

@app.post("/ingest")
async def ingest_endpoint(req: IngestRequest):
    """General Text Ingestion"""
    try:
        graph_data = extract_graph_elements(req.text)
        if graph_data.get("nodes"):
            ingestor = Neo4jIngestor()
            ingestor.ingest_batch(graph_data)
            ingestor.close()
            return {"status": "success", "message": "Data ingested successfully.", "data": graph_data}
        else:
            return {"status": "warning", "message": "No entities extracted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/graph")
async def reset_graph():
    """Resets the entire database"""
    driver = GraphDatabase.driver(URI, auth=AUTH)
    try:
        with driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
        return {"status": "success", "message": "Graph database reset successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        driver.close()

@app.post("/auth/ingest")
async def ingest_auth_profile(req: AuthIngestRequest):
    try:
        user_data = req.user_data
        print(f"Ingesting Auth Data for: {user_data.get('email')}")

        # Construct Graph Element (Person)
        # Use email as primary ID for Person node
        user_id = user_data.get("email") or user_data.get("name")
        
        if not user_id:
             return {"status": "error", "message": "No valid ID (email/name) in user data"}

        person_node = {
            "id": user_id, 
            "label": "Person",
            "properties": {
                "name": user_data.get("name", "Unknown User"),
                "email": user_data.get("email", ""),
                "image": user_data.get("image", ""),
                "source": "user",
                "layer": "Semantic",
                "verified": True
            }
        }
        
        # Ingest
        ingestor = Neo4jIngestor()
        
        # Construct graph_data for batch ingestion
        graph_data = {
            "nodes": [person_node],
            "relationships": []
        }
        
        ingestor.ingest_batch(graph_data)
        ingestor.close()
        
        return {"status": "success", "message": "Auth profile ingested."}
    except Exception as e:
        print(f"Auth Ingest Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest/search")
async def ingest_search_endpoint(req: IngestRequest):
    """Concept Ingestion (Web Search + Ontology Build)"""
    try:
        keyword = req.text
        print(f"Starting Concept Ingestion for: {keyword}")
        
        # 1. Perform Web Search
        search_context = perform_web_search(keyword)
        # print(f"Web Search Context Length: {len(search_context)}")
        
        # 2. Extract Ontology from Context
        extracted_data = extract_concept_graph(keyword, search_context)
        # print(f"Extracted Nodes: {len(extracted_data.get('nodes', []))}")
        
        # 3. Inject Source & Format Subgraph
        nodes = extracted_data.get("nodes", [])
        relationships = extracted_data.get("relationships", [])
        
        if not nodes:
            return {"status": "warning", "message": "No entities extracted from search."}

        # 4. Ingest Extracted Data into Neo4j (CRITICAL FIX)
        print(f"Ingesting {len(nodes)} nodes and {len(relationships)} relationships into Neo4j...")
        ingestor = Neo4jIngestor()
        ingestor.ingest_batch(extracted_data)
        ingestor.close()

        # 5. Re-Fetch Subgraph from Neo4j (To ensure ID consistency with get_graph)
        # We search for the Keyword node and its 1-hop neighbors
        driver = GraphDatabase.driver(URI, auth=AUTH)
        query = """
        MATCH (n) 
        WHERE toLower(n.name) CONTAINS toLower($keyword) 
           OR toLower(n.topic) CONTAINS toLower($keyword)
           OR toLower(n.id) CONTAINS toLower($keyword)
        
        OPTIONAL MATCH (n)-[r]-(m)
        RETURN n, r, m
        LIMIT 100
        """
        
        nodes_map = {}
        links = []
        
        with driver.session() as session:
            result = session.run(query, keyword=keyword)
            for record in result:
                n = record["n"]
                m = record["m"]
                r = record["r"]
                
                # Check for nulls (optional match)
                if not n: continue

                # Reuse same formatting logic as get_graph
                n_id = n.element_id if hasattr(n, "element_id") else str(n.id)
                n_props = dict(n)
                
                if n_id not in nodes_map:
                    nodes_map[n_id] = {
                        "id": n_id,
                        "label": list(n.labels)[0] if n.labels else "Unknown",
                        "val": 1,
                        **n_props
                    }

                if m and r is not None:
                    m_id = m.element_id if hasattr(m, "element_id") else str(m.id)
                    m_props = dict(m)
                    
                    if m_id not in nodes_map:
                        nodes_map[m_id] = {
                            "id": m_id,
                            "label": list(m.labels)[0] if m.labels else "Unknown",
                            "val": 1,
                            **m_props
                        }
                    
                    links.append({
                        "source": n_id,
                        "target": m_id,
                        "name": r.type
                    })
        
        driver.close()

        # If DB fetch returns empty (maybe keyword too specific?), fallback to extracted data or just return empty
        # But extracted data has wrong IDs. Ideally we trust ingest worked.
        # Let's use the DB result.

        # 6. Apply Network Analysis
        raw_nodes = list(nodes_map.values())
        enriched_data = enrich_graph_data(raw_nodes, links)

        return {
            "status": "success", 
            "message": f"Created/Fetched concept graph for '{keyword}'",
            "nodes": enriched_data["nodes"], 
            "links": enriched_data["links"],
            "context_preview": search_context[:200]
        }
            
    except Exception as e:
        print(f"Concept Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest/file")
async def ingest_file_endpoint(file: UploadFile = File(...)):
    """File Ingestion (PDF/TXT/DOCX) using Module B Pipeline"""
    try:
        # 1. Load Content
        extracted_text = await load_file_content(file)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Empty file content or unsupported format.")

        # 2. Classify & Extract (Graph ETL)
        # Using the new Module B Logic (LangChain + Gemini)
        context_text = f"Source Document: {file.filename}\n{extracted_text}"
        extracted_data = await classify_and_extract(context_text)
        
        # 3. Inject Identity Source Tag
        nodes = extracted_data.get("nodes", [])
        relationships = extracted_data.get("edges", []) # Classifier returns 'edges'
        
        # Normalize 'edges' to 'relationships' if needed by Ingestor
        # Ingestor expects 'relationships', classifier prompt said 'edges'
        if not relationships and "relationships" in extracted_data:
            relationships = extracted_data["relationships"]

        for node in nodes:
            if "properties" not in node: node["properties"] = {}
            node["properties"]["source"] = "user"
            # Layer is already determined by classifier, but ensure fallback
            if "layer" not in node: node["layer"] = node.get("label", "Semantic") 
        
        # 4. Ingest
        ingestor = Neo4jIngestor()
        # Ingestor.ingest_batch expects 'relationships' key
        final_data = {
            "nodes": nodes,
            "relationships": relationships
        }
        ingestor.ingest_batch(final_data)
        ingestor.close()
        
        return {
            "status": "success", 
            "filename": file.filename,
            "nodes_added": len(nodes),
            "edges_added": len(relationships)
        }

    except Exception as e:
        print(f"File Ingest Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Dynamic Evolution Imports
from dynamic.fetcher import fetch_dynamic_content
from dynamic.merger import merge_dynamic_data

@app.post("/graph/update")
async def update_graph_dynamic():
    """
    Triggers real-time evolution of the graph.
    1. Fetches latest news/trends based on current graph state.
    2. Extracts and merges new nodes.
    3. Returns the 'Diff' for visualization.
    """
    try:
        print("Starting Dynamic Graph Update...")
        # 1. Fetch
        context, query = fetch_dynamic_content()
        if not context or "No search results" in context:
            return {"status": "warning", "message": "No new information found."}
        
        # 2. Merge
        diff_graph = merge_dynamic_data(query, context)
        
        return {
            "status": "success",
            "message": f"Graph updated with insights on '{query}'",
            "diff": diff_graph,
            "query": query
        }

    except Exception as e:
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interviewer/trigger")
async def trigger_interviewer():
    try:
        agent = ActiveInterviewer()
        question = agent.get_proactive_question()
        agent.close()
        return {"question": question, "role": "agent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
