import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

import logging
import sys

# Load environment variables
load_dotenv()

# Enable Neo4j logging
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
logging.getLogger("neo4j").addHandler(handler)
logging.getLogger("neo4j").setLevel(logging.DEBUG)


URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

SCHEMA_FILE = "schema/v1_ontology.cypher"

def apply_schema():
    if not URI or not AUTH[1] or AUTH[1] == "your_password_here":
        print("Error: Please set your NEO4J_PASSWORD in backend/.env")
        return

    print(f"Connecting to {URI}...")
    
    try:
        with GraphDatabase.driver(URI, auth=AUTH) as driver:
            driver.verify_connectivity()
            print("Connection successful!")
            
            # Read schema file
            with open(SCHEMA_FILE, "r") as f:
                cql = f.read()
            
            # Split by semicolon to run queries one by one (simplified)
            # Note: Cypher files might have multiple commands.
            # For this simple file, we'll try to run them block by block.
            statements = cql.split(";")
            
            with driver.session() as session:
                for statement in statements:
                    stmt = statement.strip()
                    if stmt and not stmt.startswith("//"):
                        print(f"Executing: {stmt[:50]}...")
                        session.run(stmt)
                        
            print("Schema applied successfully!")
            
    except Exception as e:
        print(f"Failed to connect or apply schema: {e}")

if __name__ == "__main__":
    apply_schema()
