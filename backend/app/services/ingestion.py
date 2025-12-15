from typing import List, Optional
from langchain_core.documents import Document
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI
from langchain_community.graphs.graph_document import GraphDocument

from ..database import get_graph_db
from ..config import settings

class IngestionService:
    def __init__(self):
        # Initialize the LLM for graph extraction if key is present
        if settings.OPENAI_API_KEY:
            self.llm = ChatOpenAI(
                temperature=0,
                model="gpt-4o-mini",
                api_key=settings.OPENAI_API_KEY
            )
            self.transformer = LLMGraphTransformer(llm=self.llm)
        else:
            self.llm = None
            self.transformer = None
        
    async def process_text_to_graph(self, text: str, metadata: Optional[dict] = None) -> List[GraphDocument]:
        """
        Processes raw text:
        1. Wraps it in a LangChain Document.
        2. Extracts graph data (nodes/relationships) using LLM.
        3. Generates Embeddings for Nodes (Hybrid Memory).
        4. Stores the graph data into Neo4j.
        """
        if not text.strip():
            return []

        if not self.llm or not self.transformer:
            raise ValueError("OpenAI API Key is missing. Cannot process text.")
            
        # Check DB connection early
        try:
            graph = get_graph_db()
        except:
            raise ValueError("Database connection failed. Cannot store graph.")

        # 1. Concept Expansion (The "Brain" Logic)
        processed_text = text
        if len(text.split()) < 20:
            print(f"🌱 Short input detected ('{text}'). Expanding concept...")
            try:
                expansion_prompt = [
                    ("system", "You are an expert ontology engineer and distinct knowledge base. Your goal is to expand upon the user's seed concept to create a rich, structured knowledge context."),
                    ("human", f"Provide a comprehensive, encyclopedic definition and context for the concept: '{text}'. Include its nature, key components, purpose, history (if applicable), and relationships to other major concepts. Write in a clear, factual style suitable for knowledge graph extraction.")
                ]
                response = self.llm.invoke(expansion_prompt)
                expanded_text = response.content
                print(f"🌳 Concept Expanded: {expanded_text[:100]}...")
                processed_text = f"Context for '{text}':\n{expanded_text}"
            except Exception as e:
                print(f"⚠️ Expansion failed: {e}. Proceeding with original text.")

        # 2. Convert to Document
        doc = Document(page_content=processed_text, metadata=metadata or {})
        
        print(f"🧠 Extracting graph from text ({len(processed_text)} chars)...")
        
        # 3. Transform to GraphDocument
        # convert_to_graph_documents is synchronous in current LangChain version
        graph_documents = self.transformer.convert_to_graph_documents([doc])
        
        if not graph_documents:
            print("⚠️ No graph structure extracted.")
            return []

        print(f"✨ Extracted {len(graph_documents[0].nodes)} nodes and {len(graph_documents[0].relationships)} relationships.")

        # 3.5 Generate Embeddings for Nodes
        print("🧬 Generating Embeddings for Hybrid Memory...")
        if settings.OPENAI_API_KEY:
            from langchain_openai import OpenAIEmbeddings
            embeddings = OpenAIEmbeddings(model="text-embedding-3-small", api_key=settings.OPENAI_API_KEY)
        else:
            print("⚠️ No API Key for embeddings. Skipping.")
            embeddings = None
        
        for doc in graph_documents:
            for node in doc.nodes:
                # Standardize Label for Vector Index (Concept)
                node.properties["original_type"] = node.type
                node.type = "Concept"

                # Embedding content: ID + Type ( + Description if we had it, but currently LLMGraphTransformer doesn't output it easily)
                text_to_embed = f"{node.id} ({node.properties['original_type']})"
                if embeddings:
                    # Synchronous embedding generation (batching would be better for scale)
                    vector = await embeddings.aembed_query(text_to_embed)
                    
                    # Attach to node properties
                    node.properties["embedding"] = vector
                # Also set last_accessed
                from datetime import datetime
                node.properties["last_accessed"] = datetime.utcnow().isoformat()

        # 4. Store in Neo4j
        graph = get_graph_db()
        
        # add_graph_documents adds nodes and relationships to the graph
        graph.add_graph_documents(
            graph_documents, 
            include_source=True
        )
        
        print("💾 Knowledge Graph stored in Neo4j with Embeddings.")
        
        return graph_documents

# Singleton instance for easy import
ingestion_service = IngestionService()
