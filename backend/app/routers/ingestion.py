from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any
from ..services.ingestion import ingestion_service

router = APIRouter()

class IngestRequest(BaseModel):
    text: str
    metadata: dict = {}

class IngestResponse(BaseModel):
    message: str
    nodes_created: int
    relationships_created: int
    graph_data: List[Any] = []

@router.post("/ingest", response_model=IngestResponse)
async def ingest_knowledge(request: IngestRequest):
    """
    Ingests text, converts it to a knowledge graph using LLM, and stores it in Neo4j.
    """
    try:
        print(f"📥 Received ingestion request: {request.text[:50]}...")
        graph_docs = await ingestion_service.process_text_to_graph(request.text, request.metadata)
        
        node_count = sum(len(doc.nodes) for doc in graph_docs)
        rel_count = sum(len(doc.relationships) for doc in graph_docs)
        
        # Serialize GraphDocument objects to JSON-compatible format
        serialized_graph = []
        for doc in graph_docs:
            serialized_graph.append({
                "nodes": [
                    {"id": n.id, "type": n.type, "properties": n.properties} 
                    for n in doc.nodes
                ],
                "relationships": [
                    {
                        "source": {"id": r.source.id, "type": r.source.type}, 
                        "target": {"id": r.target.id, "type": r.target.type}, 
                        "type": r.type, 
                        "properties": r.properties
                    } 
                    for r in doc.relationships
                ]
            })
        
        return IngestResponse(
            message="Knowledge Graph ingestion successful",
            nodes_created=node_count,
            relationships_created=rel_count,
            graph_data=serialized_graph
        )
    except Exception as e:
        print(f"❌ Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
