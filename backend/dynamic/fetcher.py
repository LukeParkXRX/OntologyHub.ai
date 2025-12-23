
import os
import logging
from neo4j import GraphDatabase
from parser.web_search import perform_web_search
from dotenv import load_dotenv

load_dotenv()

# --- Neo4j Config ---
URI = os.getenv("NEO4J_URI", "neo4j+ssc://b60a0727.databases.neo4j.io")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

def get_top_keywords(limit=3):
    """
    Fetches top connected nodes (Degree Centrality) from Neo4j to form a context-aware query.
    """
    driver = GraphDatabase.driver(URI, auth=AUTH)
    keywords = []
    try:
        with driver.session() as session:
            # Simple Degree Centrality
            query = """
            MATCH (n)
            WHERE n.name IS NOT NULL
            RETURN n.name AS name, count{(n)--()} AS degree
            ORDER BY degree DESC
            LIMIT $limit
            """
            result = session.run(query, limit=limit)
            keywords = [record["name"] for record in result]
    except Exception as e:
        logging.error(f"Error fetching top keywords: {e}")
    finally:
        driver.close()
    
    return keywords

def fetch_dynamic_content():
    """
    1. Analyze Graph (Get Top Keywords)
    2. Generate Search Query
    3. Perform Web Search
    4. Return Context & Used Query
    """
    keywords = get_top_keywords(limit=2)
    
    if not keywords:
        query = "latest technology trends AI and Future" # Fallback
    else:
        # Construct a query that looks for "News" or "Updates" about these components
        query = f"{' '.join(keywords)} latest developments trends news"
    
    print(f"[Dynamic Fetcher] Generated Query: {query}")
    
    context = perform_web_search(query, max_results=5)
    return context, query
