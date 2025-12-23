from neo4j import GraphDatabase
import os
from .cypher_gen import generate_cypher

# Use 'ssc' if needed based on previous config
URI = os.getenv("NEO4J_URI", "neo4j+ssc://b60a0727.databases.neo4j.io")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

class GraphRetriever:
    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)

    def close(self):
        self.driver.close()

    def retrieve(self, question: str) -> str:
        """
        Main retrieval function:
        1. Convert Question -> Cypher
        2. Execute Cypher
        3. Simple Context formatting
        """
        cypher_query = generate_cypher(question)
        print(f"Generated Cypher: {cypher_query}")
        
        if not cypher_query:
            return "No valid query generated."
            
        try:
            results = self._execute_query(cypher_query)
            # Include Query in Context for better answer generation
            return f"Cypher Query: {cypher_query}\nResults:\n" + self._format_results(results)
        except Exception as e:
            return f"Error executing query: {e}"

    def _execute_query(self, query):
        with self.driver.session() as session:
            result = session.run(query)
            return [record.data() for record in result]

    def _format_results(self, results):
        if not results:
            return "No information found in the graph."
        
        # Determine format based on structure
        formatted = []
        for row in results:
            formatted.append(str(row))
        
        return "\n".join(formatted)

if __name__ == "__main__":
    retriever = GraphRetriever()
    print(retriever.retrieve("What did Jinsu do?"))
    retriever.close()
