
import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

URI = os.getenv("NEO4J_URI", "neo4j+ssc://b60a0727.databases.neo4j.io")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

def create_constraints_and_indexes():
    driver = GraphDatabase.driver(URI, auth=AUTH)
    
    # 1. Deduplication Queries (Cleanup before constraint)
    cleanup_queries = [
        """
        MATCH (n:Person)
        WITH n.name as name, collect(n) as nodes
        WHERE size(nodes) > 1
        FOREACH (n in tail(nodes) | DETACH DELETE n)
        """,
        """
        MATCH (n:Organization)
        WITH n.name as name, collect(n) as nodes
        WHERE size(nodes) > 1
        FOREACH (n in tail(nodes) | DETACH DELETE n)
        """,
        """
        MATCH (n:Skill)
        WITH n.name as name, collect(n) as nodes
        WHERE size(nodes) > 1
        FOREACH (n in tail(nodes) | DETACH DELETE n)
        """,
        """
        MATCH (n:Concept)
        WITH n.id as id, collect(n) as nodes
        WHERE size(nodes) > 1
        FOREACH (n in tail(nodes) | DETACH DELETE n)
        """
    ]

    commands = [
        # Unique Constraints (Prevent Duplicates)
        "CREATE CONSTRAINT person_name IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE",
        "CREATE CONSTRAINT org_name IF NOT EXISTS FOR (o:Organization) REQUIRE o.name IS UNIQUE",
        "CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE",
        "CREATE CONSTRAINT interest_topic IF NOT EXISTS FOR (i:Interest) REQUIRE i.topic IS UNIQUE",
        "CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE",
        
        # Indexes (Speed up Lookups)
        "CREATE INDEX node_name_index IF NOT EXISTS FOR (n:Person) ON (n.name)",
        "CREATE INDEX node_topic_index IF NOT EXISTS FOR (n:Interest) ON (n.topic)",
        "CREATE INDEX node_label_index IF NOT EXISTS FOR (n:Concept) ON (n.label)"
    ]
    
    try:
        with driver.session() as session:
            print("--- 1. Removing Duplicates ---")
            for q in cleanup_queries:
                session.run(q)
                
            print("--- 2. Applying Constraints & Indexes ---")
            for cmd in commands:
                print(f"Executing: {cmd}")
                session.run(cmd)
        print("SUCCESS: Database schema optimized.")
    except Exception as e:
        print(f"FAIL: Optimization Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    create_constraints_and_indexes()
