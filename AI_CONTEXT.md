# PROJECT CONTEXT: OntologyHub.ai

## 1. Project Vision & Identity
- **Project Name:** OntologyHub.ai
- **Slogan:** The Brain for Living AI
- **Core Vision:** "ALIVE" - We build AI that exists, remembers, and relates. We are moving beyond the "Smart Fool" era of hallucinating LLMs to an era of "Cognitive Entities" with structured long-term memory.

## 2. Product Overview
OntologyHub.ai is a SaaS platform that automatically converts unstructured data (Web, PDF, YouTube) into structured **Knowledge Graphs**. It serves as an external brain for AI agents, connecting via **API** and **MCP (Model Context Protocol)** to provide zero-hallucination responses.

## 3. Key Features (MVP)
1.  **Active Ingestion:**
    - Generates Knowledge Graphs from Web Search (Tavily API) and File Uploads.
    - Uses LLM (GPT-4o-mini) for Auto-Schema Induction and Entity Extraction.
2.  **Hybrid Memory System (The Core):**
    - **Architecture:** Unifies Short-Term and Long-Term memory within **Neo4j**.
    - **Vector Index:** For fast, similarity-based retrieval (STM context).
    - **Graph Structure:** For logic, reasoning, and relationship traversal (LTM context).
    - **Consolidation:** Logic to structure incoming vector data into the knowledge graph.
3.  **Universal Connectivity:**
    - Provides **MCP Server** endpoints for instant connection with Claude Desktop and ChatGPT.
4.  **Visual Interaction:**
    - "Organic Intelligence" UI design.
    - Interactive graph visualization using React Flow.

## 4. Tech Stack (Strict Constraints)
- **Environment:** Google Project IDX (Antigravity)
- **Backend:** Python 3.11+, FastAPI (Async), Pydantic
- **Database:** **Neo4j AuraDB** (Cloud) - Uses both Graph and Vector Indexes.
- **AI/LLM:** LangChain, LangGraph, OpenAI API, Tavily API
- **Protocol:** MCP (Model Context Protocol) SDK for Python
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, React Flow

## 5. Development Guidelines
- **Architecture:** Modular Monolith. Separate `services/ingestion`, `services/retrieval`, `routers` clearly.
- **Database Access:** Use `neo4j` official driver and `langchain-neo4j` wrapper. Do NOT use other graph DBs.
- **Async:** All I/O operations (DB, API calls) must be `async/await`.
- **UX Philosophy:** "Invisible Tech." Hide the complexity of triples/schemas; show the beauty of connected knowledge.

## 7. Design & UX Guidelines (Organic Intelligence)
- **Core Philosophy:** "Not a Database, But a Living Organism." The UI should feel alive, breathing, and organic, not like a static admin dashboard.
- **Visual Style:**
    - **Theme:** Deep Navy background (#0F172A) with Bioluminescent accents (Cyan #22D3EE, Purple #A855F7).
    - **Components:** Glassmorphism (Frosted Glass effect with `backdrop-filter: blur()`) for panels and cards.
    - **Typography:** Modern Humanist Sans-serif (Pretendard, Inter).
- **Interaction:**
    - **Breathing Graph:** Nodes should float gently even when idle.
    - **Invisible Tech:** Hide complex IDs/schemas by default; reveal details on hover.
    - **Conversational:** Use natural language dialogs instead of rigid forms.
    - **Semantic Zoom:** Show clusters/colors at low zoom, details at high zoom.
- **Frontend Tech:** Use `framer-motion` for fluid animations and `reactflow` for the graph canvas. Use Tailwind CSS for styling.

---
*Note to AI Assistant: Always refer to this document before generating code or suggesting architecture. Ensure all outputs align with the "ALIVE" vision and "Neo4j-based Hybrid RAG" architecture.*