from graphrag.retriever import GraphRetriever
from graphrag.answer_gen import generate_answer

def run_graphrag_test():
    retriever = GraphRetriever()
    
    questions = [
        "Jinsu는 어디서 일해?",
        "Jinsu가 다녀온 산은 어디야?",
        "2024년 12월에 무슨 일이 있었어?"
    ]
    
    print("--- GraphRAG Test Started ---")
    
    for q in questions:
        print(f"\n[Q]: {q}")
        
        # 1. Retrieve
        context = retriever.retrieve(q)
        print(f"[Context]: {context[:100]}...") # Truncate log
        
        # 2. Generate Answer
        answer = generate_answer(q, context)
        print(f"[A]: {answer}")
        
    retriever.close()

if __name__ == "__main__":
    run_graphrag_test()
