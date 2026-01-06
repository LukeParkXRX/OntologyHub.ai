import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure LLM
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-3-flash')

# Define Output Schema
# Nodes: { "label": "Person"|"Event"|"Emotion"|"Skill"|"Organization", "name": "...", "properties": {...} }
# Edges: { "source": "name", "target": "name", "relation": "..." }

CLASSIFY_PROMPT = """
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
"""

async def classify_and_extract(text: str) -> Dict[str, Any]:
    try:
        prompt = CLASSIFY_PROMPT.format(text=text)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        result = json.loads(response.text)
        return result
    except Exception as e:
        print(f"Error in classification with Gemini SDK: {e}")
        return {"nodes": [], "edges": []}
