from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.file_processing import file_processing_service

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads a file (PDF, Excel, Docx, Image) and ingests it into the knowledge graph.
    """
    print(f"📂 Received file upload: {file.filename}")
    
    try:
        # Pass to service
        graph_docs = await file_processing_service.process_file(file)
        
        node_count = sum(len(doc.nodes) for doc in graph_docs)
        
        return {
            "message": f"Successfully processed {file.filename}",
            "filename": file.filename,
            "nodes_created": node_count,
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
