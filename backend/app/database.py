from typing import Optional
from langchain_neo4j import Neo4jGraph
from app.config import settings

class GraphDatabase:
    _instance: Optional[Neo4jGraph] = None

    @classmethod
    def get_instance(cls) -> Neo4jGraph:
        """
        Singleton pattern to get or create a Neo4jGraph instance.
        """
        if cls._instance is None:
            print(f"� Connecting to Neo4j at: {settings.NEO4J_URI}")
            try:
                cls._instance = Neo4jGraph(
                    url=settings.NEO4J_URI,
                    username=settings.NEO4J_USERNAME,
                    password=settings.NEO4J_PASSWORD,
                )
            except Exception as e:
                print(f"❌ Neo4jGraph Init Error: {e}")
                raise e
            # Verify connection by refreshing schema
            cls._instance.refresh_schema()
            
            # Apply Constraints & Indexes
            print("🛠️ Applying Neo4j Constraints & Indexes...")
            cls.apply_constraints(cls._instance)
            
            print("✅ Neo4j Graph Connection Established & Schema Refreshed.")
        return cls._instance

    @staticmethod
    def apply_constraints(graph: Neo4jGraph):
        """
        Applies uniqueness constraints and vector indexes.
        """
        # 1. Uniqueness Constraints
        queries = [
            "CREATE CONSTRAINT unique_concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE",
            "CREATE CONSTRAINT unique_entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE",
            # 2. Vector Index for Semantic Search (Hybrid Memory)
            """
            CREATE VECTOR INDEX vector_embedding_index IF NOT EXISTS
            FOR (c:Concept)
            ON (c.embedding)
            OPTIONS {indexConfig: {
                `vector.dimensions`: 1536,
                `vector.similarity_function`: 'cosine'
            }}
            """
        ]
        
        for q in queries:
            try:
                graph.query(q)
            except Exception as e:
                print(f"⚠️ Failed to apply constraint: {e}")
                
    @classmethod
    def close(cls):
        """
        Close the connection if needed.
        Note: Neo4jGraph manages its own driver usually, but good for cleanup hook.
        """
        if cls._instance:
            # Currently langchain-neo4j's Neo4jGraph doesn't expose a clean close method 
            # for the underlying driver efficiently in the public API, 
            # but we can reset the instance.
            cls._instance = None
            print("🛑 Neo4j Connection Closed.")

def get_graph_db() -> Neo4jGraph:
    """Dependency injection helper"""
    return GraphDatabase.get_instance()
