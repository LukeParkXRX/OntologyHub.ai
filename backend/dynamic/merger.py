
from parser.extractor import extract_concept_graph
from parser.ingest import Neo4jIngestor

def merge_dynamic_data(keyword_query: str, context_text: str):
    """
    1. Extract Graph from Context (using Gemini).
    2. Ingest to Neo4j.
    3. Return 'Diff' (The extracted subgraph).
    """
    print(f"[Dynamic Merger] Extracting from context of length {len(context_text)}...")
    
    # 1. Extraction
    # We use 'extract_concept_graph' because it's designed for "Search Context -> Graph"
    # Even though query might be "AI Future", it treats it as the core concept.
    extracted_data = extract_concept_graph(keyword_query, context_text)
    
    nodes = extracted_data.get("nodes", [])
    if not nodes:
        print("[Dynamic Merger] No nodes extracted.")
        return {"nodes": [], "links": []}

    # 2. Ingestion (Merege)
    print(f"[Dynamic Merger] Ingesting {len(nodes)} nodes...")
    ingestor = Neo4jIngestor()
    ingestor.ingest_batch(extracted_data)
    ingestor.close()
    
    # 3. Return Diff
    # For visualization, we just return what was found. 
    # The Frontend will merge this into the existing 3D graph, highlighting new stuff.
    # To confirm persistence, we might want to re-fetch from DB, but for "Diff" visualization, 
    # the extracted structure is exactly what we want to "Flash".
    
    # However, to ensure IDs match DB logic (if any specific ID generation happens), 
    # we usually rely on Ingestor. But Ingestor uses IDs provided in JSON if they look valid.
    # Our prompt asks for normalized IDs.
    
    # Let's standardize the return format to match GraphData model
    # Convert 'relationships' -> 'links' with source/target
    links = []
    for rel in extracted_data.get("relationships", []):
        links.append({
            "source": rel["from"],
            "target": rel["to"],
            "name": rel["type"]
        })
        
    return {
        "nodes": nodes,
        "links": links
    }
