from duckduckgo_search import DDGS
import logging

def perform_web_search(keyword: str, max_results: int = 5) -> str:
    """
    Performs a web search using DuckDuckGo and returns a summarized text context.
    """
    try:
        results = DDGS().text(keyword, max_results=max_results)
        if not results:
            return f"No search results found for '{keyword}'."
        
        context = ""
        for i, res in enumerate(results):
            context += f"Source {i+1}: {res['title']}\n{res['body']}\n\n"
            
        return context
    except Exception as e:
        logging.error(f"Web Search Error: {e}")
        return f"Error performing web search for '{keyword}'."

if __name__ == "__main__":
    print(perform_web_search("Pikachu"))
