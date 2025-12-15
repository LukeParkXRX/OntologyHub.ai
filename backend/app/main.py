from contextlib import asynccontextmanager
from fastapi import FastAPI
from .config import settings
from .database import get_graph_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Life span events:
    - Startup: Connect to DB
    - Shutdown: Close connections
    """
    try:
        # Test connection on startup
        graph = get_graph_db()
        print(f"🚀 {settings.PROJECT_NAME} Backend Started.")
    except Exception as e:
        print(f"❌ Failed to connect to Neo4j: {e}")
        print("⚠️ Application starting in Offline Mode (Database unavailable)")
    
    # Always yield to let the application start
    yield
        
    # Cleanup runs after the application shuts down
    print(f"👋 {settings.PROJECT_NAME} Shutting down...")

from .routers import ingestion
from .routers import recall

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion.router, prefix="/api/v1", tags=["Ingestion"])
app.include_router(recall.router, prefix="/api/v1", tags=["Memory"])


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "vision": "ALIVE",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    try:
        graph = get_graph_db()
        # Simple query to check connectivity
        graph.query("RETURN 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
