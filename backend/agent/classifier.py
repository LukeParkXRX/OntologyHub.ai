
import os
import json
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro", # Use Pro for better reasoning
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0
)

# Define Output Schema
# We want a list of nodes and edges to be created.
# Nodes: { "label": "Person"|"Event"|"Emotion"|"Skill"|"Organization", "name": "...", "properties": {...} }
# Edges: { "source": "name", "target": "name", "relation": "..." }

parser = JsonOutputParser()

CLASSIFY_PROMPT = PromptTemplate(
    template="""
    You are the ALIVE Schema Architect. Your goal is to analyze the user's personal document text (Resume, Diary, Interview, etc.) and extract a Knowledge Graph.
    
    Please extract Entities and Relationships following the ALIVE Ontology.
    
    **Layers & Node Types:**
    1. **Semantic Layer (Facts)**:
       - `Organization` (Company, School)
       - `Skill` (Tech, Language)
       - `Role` (Job Title)
       - `Person` (People mentioned)
    
    2. **Episodic Layer (Time-Space Events)**:
       - `Event`: A specific event with a timeframe. (e.g., "Graduation 2023", "Project Alpha Launch")
       - MUST include 'date' or 'year' property if inferred.
    
    3. **Psychometric Layer (Inner Self)**:
       - `Emotion`: Abstract feelings (e.g., "Accomplished", "Anxious", "Joy").
       - `Value`: Core values (e.g., "Growth", "Freedom", "Stability").
    
    **Instructions:**
    - Detect the user's name if possible (default to "User" or context).
    - Create relations like `(:Person)-[:EXPERIENCED]->(:Event)`, `(:Event)-[:CAUSED]->(:Emotion)`, `(:Person)-[:HAS_SKILL]->(:Skill)`.
    - Return a JSON object with "nodes" and "edges".
    
    **Input Text:**
    {text}
    
    **Format:**
    {{
        "nodes": [
            {{ "id": "Unique Name", "label": "Label", "properties": {{ "description": "...", "date": "YYYY-MM-DD" }} }}
        ],
        "edges": [
            {{ "source": "Source Node ID", "target": "Target Node ID", "relation": "RELATION_TYPE" }}
        ]
    }}
    """,
    input_variables=["text"],
)

chain = CLASSIFY_PROMPT | llm | parser

async def classify_and_extract(text: str) -> Dict[str, Any]:
    try:
        result = await chain.ainvoke({"text": text})
        return result
    except Exception as e:
        print(f"Error in classification: {e}")
        return {"nodes": [], "edges": []}
