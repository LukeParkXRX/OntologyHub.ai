
import os
import json
import traceback
from dotenv import load_dotenv
from parser.web_search import perform_web_search
from parser.extractor import extract_concept_graph
from parser.ingest import Neo4jIngestor
from neo4j import GraphDatabase

# Load Env
load_dotenv()

def debug_pipeline(keyword="Superman"):
    print(f"--- 1. Testing Web Search for '{keyword}' ---")
    try:
        context = perform_web_search(keyword, max_results=3)
        print(f"Context Length: {len(context)}")
        if len(context) < 100:
            print("WARNING: Context is too short. Web Search might be failing.")
    except Exception as e:
        print(f"FAIL: Web Search Error: {e}")
        traceback.print_exc()
        return

    print(f"\n--- 2. Testing LLM Extraction ---")
    try:
        data = extract_concept_graph(keyword, context)
        nodes = data.get("nodes", [])
        links = data.get("relationships", [])
        print(f"Extracted Nodes: {len(nodes)}")
        print(f"Extracted Links: {len(links)}")
        
        if not nodes:
            print("FAIL: No nodes extracted. LLM Prompt issue or Rate Limit?")
            print("Raw Data:", json.dumps(data, indent=2))
            return
            
        # Validate ID consistency
        central_node_found = False
        normalized_keyword = keyword.lower().replace(" ", "_").replace("-", "_")
        for n in nodes:
            # loose check
            if keyword.lower() in n['id'].lower():
                central_node_found = True
        
        if not central_node_found:
             print(f"WARNING: Central node '{keyword}' not found in specific ID format.")

    except Exception as e:
        print(f"FAIL: Extraction Error: {e}")
        traceback.print_exc()
        return

    print(f"\n--- 3. Testing Neo4j Ingestion ---")
    try:
        ingestor = Neo4jIngestor()
        ingestor.ingest_batch(data) # Using the batch method we improved
        ingestor.close()
        print("SUCCESS: Ingestion called without error.")
    except Exception as e:
        print(f"FAIL: Ingestion Error: {e}")
        traceback.print_exc()
        return

    print(f"\n--- 4. Verifying Data in Neo4j ---")
    try:
        URI = os.getenv("NEO4J_URI")
        AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
        driver = GraphDatabase.driver(URI, auth=AUTH)
        with driver.session() as session:
            # Check for the keyword node
            result = session.run("MATCH (n) WHERE toLower(n.name) CONTAINS toLower($k) RETURN count(n) as count", k=keyword)
            count = result.single()["count"]
            print(f"Neo4j Query Found {count} nodes matching '{keyword}'.")
            
            # Verify Relationships
            rel_query = f"""
            MATCH (n)-[r]-(m) WHERE toLower(n.name) CONTAINS toLower('{keyword}')
            RETURN count(r) as rel_count
            """
            rel_result = session.run(rel_query)
            rel_count = rel_result.single()["rel_count"]
            print(f"Neo4j Query Found {rel_count} relationships connected to '{keyword}'.")

            # Check for any nodes
            result_all = session.run("MATCH (n) RETURN count(n) as count")
            total = result_all.single()["count"]
            print(f"Total Nodes in DB: {total}")
            
        driver.close()
    except Exception as e:
        print(f"FAIL: Vertification Query Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    debug_pipeline("Superman")
