import sys
import os
import json
from parser.extractor import extract_graph_elements
from parser.ingest import Neo4jIngestor

def run_test_pipeline():
    print("--- 1. Testing Extraction (OpenAI) ---")
    sample_text = """
    Jinsu joined OntologyHub AI as a Senior Researcher in Dec 2024. 
    He loves Graph Databases and Hiking. 
    Last weekend, he visited Hallasan mountain.
    """
    
    data = extract_graph_elements(sample_text, document_date="2025-01-01")
    print("Extracted Data JSON:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    if not data.get("nodes"):
        print("Extraction failed or empty.")
        return

    print("\n--- 2. Testing Ingestion (Neo4j) ---")
    try:
        ingestor = Neo4jIngestor()
        ingestor.ingest_batch(data)
        ingestor.close()
        print("Ingestion completed successfully!")
    except Exception as e:
        print(f"Ingestion failed: {e}")

if __name__ == "__main__":
    run_test_pipeline()
