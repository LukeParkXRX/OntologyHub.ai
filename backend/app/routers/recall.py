from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any, Optional
from ..database import get_graph_db

router = APIRouter()

class RecallRequest(BaseModel):
    query: Optional[str] = None  # Optional: if provided, use vector search for related concepts
    limit: int = 100  # Max nodes to recall

class RecallResponse(BaseModel):
    message: str
    node_count: int
    relationship_count: int
    nodes: List[Any] = []
    relationships: List[Any] = []

@router.get("/recall", response_model=RecallResponse)
async def recall_memory(limit: int = 100):
    """
    Recall the entire knowledge graph from Neo4j (limited).
    This provides the "memory" for OntologyHub.AI on page load.
    """
    try:
        graph = get_graph_db()
        
        # Query to get all nodes and relationships
        result = graph.query(f"""
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->(m)
            WITH n, r, m
            LIMIT {limit * 2}
            RETURN 
                collect(distinct {{id: n.id, type: labels(n)[0], properties: properties(n)}}) as nodes,
                collect(distinct {{source: n.id, target: m.id, type: type(r)}}) as relationships
        """)
        
        if result and len(result) > 0:
            nodes = result[0].get('nodes', [])
            relationships = [r for r in result[0].get('relationships', []) if r.get('target') is not None]
            
            return RecallResponse(
                message="Memory recalled successfully",
                node_count=len(nodes),
                relationship_count=len(relationships),
                nodes=nodes,
                relationships=relationships
            )
        
        return RecallResponse(
            message="No memories found",
            node_count=0,
            relationship_count=0,
            nodes=[],
            relationships=[]
        )
        
    except Exception as e:
        print(f"❌ Recall failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recall/search")
async def recall_by_vector(query: str, limit: int = 20):
    """
    Recall related concepts using vector similarity search.
    """
    try:
        from langchain_openai import OpenAIEmbeddings
        from ..config import settings
        
        graph = get_graph_db()
        
        # Generate embedding for query
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small", api_key=settings.OPENAI_API_KEY)
        query_vector = embeddings.embed_query(query)
        
        # Vector search query (requires Neo4j vector index)
        result = graph.query(f"""
            CALL db.index.vector.queryNodes('vector_embedding_index', {limit}, {query_vector})
            YIELD node, score
            MATCH (node)-[r]-(related)
            RETURN 
                node.id as id, 
                labels(node)[0] as type,
                score,
                collect(distinct {{id: related.id, type: labels(related)[0], rel: type(r)}}) as connections
            ORDER BY score DESC
        """)
        
        return {
            "message": f"Found {len(result)} related concepts",
            "results": result
        }
        
    except Exception as e:
        print(f"❌ Vector search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
