import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from .extractor_prompt import get_extraction_prompt, get_concept_extraction_prompt

# Load environment variables
load_dotenv()

# Configure Gemini
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

def extract_graph_elements(text: str, document_date: str = None) -> dict:
    """
    Extracts graph nodes and relationships from text using Google Gemini.
    """
    if not GENAI_API_KEY:
        print("Error: GEMINI_API_KEY not found in .env")
        return {"nodes": [], "relationships": []}

    prompt = get_extraction_prompt(text, document_date)
    
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview') # User requested gemini-3-flash (Likely preview)
        
        # Gemini specific constraint for JSON
        generation_config = genai.GenerationConfig(
            response_mime_type="application/json"
        )

        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        content = response.text
        return json.loads(content)
        
    except Exception as e:
        print(f"Error during extraction with Gemini: {e}")
        return {"nodes": [], "relationships": []}

def extract_concept_graph(keyword: str, context_text: str) -> dict:
    """
    Extracts concept ontology from web search context using Gemini.
    """
    if not GENAI_API_KEY:
        print("Error: GEMINI_API_KEY not found in .env")
        return {"nodes": [], "relationships": []}

    prompt = get_concept_extraction_prompt(keyword, context_text)
    
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview') 
        
        generation_config = genai.GenerationConfig(
            response_mime_type="application/json"
        )

        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        content = response.text
        return json.loads(content)
        
    except Exception as e:
        print(f"Error during concept extraction with Gemini: {e}")
        return {"nodes": [], "relationships": []}

if __name__ == "__main__":
    # Test run
    sample_text = "I joined Samsung Electronics in May 2020 as a Software Engineer. It was a great challenge."
    result = extract_graph_elements(sample_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
