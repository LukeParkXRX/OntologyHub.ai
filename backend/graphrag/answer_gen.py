import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

ANSWER_SYSTEM_PROMPT = """
You are a helpful assistant for a Personal Knowledge Graph.
Use the provided [Graph Context] to answer the [User Question].
If the context is empty or irrelevant, you may say "I don't have enough information in my graph."
However, try to answer based on the partial information provided.
"""

def generate_answer(question: str, context: str) -> str:
    """
    Synthesizes an answer using Gemini given the retrieved context.
    """
    try:
        model = genai.GenerativeModel('gemini-3-flash')
        
        prompt = f"""{ANSWER_SYSTEM_PROMPT}

[Graph Context]
{context}

[User Question]
{question}

Answer:"""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating answer: {e}"
