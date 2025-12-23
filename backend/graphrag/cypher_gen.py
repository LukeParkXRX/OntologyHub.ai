import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

SYSTEM_PROMPT = """
You are an expert Neo4j Cypher translator.
Your task is to convert a user's natural language question into a valid Cypher query.

### Schema
Nodes:
- Person {name, email}
- Event {summary, date, sentiment}
- Organization {name}
- Skill {name}
- Interest {topic}
- Location {name}

Relationships:
- (:Person)-[:EXPERIENCED]->(:Event)
- (:Person)-[:BELONGS_TO {role, start_date}]->(:Organization)
- (:Person)-[:HAS_SKILL]->(:Skill)
- (:Person)-[:INTERESTED_IN]->(:Interest)
- (:Event)-[:OCCURRED_AT]->(:Location)

### Rules
1. Use `MATCH` to find relevant patterns.
2. Use `WHERE` for filtering (case-insensitive for names).
3. RETURN the specific node or property asked for.
4. Output ONLY the Cypher query text, no markdown.
5. Current date is 2025-12-21.

### Examples
Q: "Where does Jinsu work?"
A: MATCH (p:Person {name: 'Jinsu'})-[:BELONGS_TO]->(o:Organization) RETURN o.name

Q: "What events happened in 2024?"
A: MATCH (e:Event) WHERE e.date STARTS WITH '2024' RETURN e.summary, e.date
"""

def generate_cypher(question: str) -> str:
    """
    Converts a natural language question to a Cypher query using Gemini.
    """
    if not GENAI_API_KEY:
        print("Error: GEMINI_API_KEY not found.")
        return ""

    try:
        model = genai.GenerativeModel('gemini-3-flash-preview') # Consistent with Extractor
        
        prompt = f"{SYSTEM_PROMPT}\n\nQ: {question}\nA:"
        
        response = model.generate_content(prompt)
        cypher = response.text.strip()
        
        # Cleanup markdown code blocks if present
        if cypher.startswith("```"):
            cypher = cypher.replace("```cypher", "").replace("```", "").strip()
            
        return cypher

    except Exception as e:
        print(f"Error generating Cypher: {e}")
        return ""
