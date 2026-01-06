from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

URI = os.getenv("NEO4J_URI", "neo4j+ssc://b60a0727.databases.neo4j.io")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

def wipe_db():
    print("WARNING: Wiping all data from Neo4j...")
    driver = GraphDatabase.driver(URI, auth=AUTH)
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
    driver.close()
    print("Database wiped.")

if __name__ == "__main__":
    wipe_db()
