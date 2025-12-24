import os
import json
from dotenv import load_dotenv
import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from .extractor_prompt import get_extraction_prompt, get_concept_extraction_prompt

# Load environment variables
load_dotenv()

# Configure LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro", # Use Pro for reasoning
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0
)

parser = JsonOutputParser()

def extract_graph_elements(text: str, document_date: str = None) -> dict:
    """
    Extracts graph nodes and relationships from text using Google Gemini (LangChain).
    """
    try:
        raw_prompt = get_extraction_prompt(text, document_date)
        prompt = PromptTemplate.from_template("{input}")
        
        chain = prompt | llm | parser
        
        result = chain.invoke({"input": raw_prompt})
        return result
        
    except Exception as e:
        print(f"Error during extraction with Gemini: {e}")
        return {"nodes": [], "relationships": []}

def extract_concept_graph(keyword: str, context_text: str) -> dict:
    """
    Extracts concept ontology from web search context using Gemini (LangChain).
    """
    try:
        raw_prompt = get_concept_extraction_prompt(keyword, context_text)
        prompt = PromptTemplate.from_template("{input}")
        
        chain = prompt | llm | parser
        
        result = chain.invoke({"input": raw_prompt})
        return result
        
    except Exception as e:
        print(f"Error during concept extraction with Gemini: {e}")
        return {"nodes": [], "relationships": []}

if __name__ == "__main__":
    # Test run
    sample_text = "I joined Samsung Electronics in May 2020 as a Software Engineer. It was a great challenge."
    result = extract_graph_elements(sample_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
