import os
import json
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+ssc://b60a0727.databases.neo4j.io")
NEO4J_AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")

if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
    
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Active Interviewer Agent ---

class ActiveInterviewer:
    """
    The 'Psychologist' Agent.
    Scans the graph for missing links (e.g., Job without Satisfaction, Event without Emotion)
    and generates questions to fill them.
    """
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    def close(self):
        self.driver.close()

    def scan_for_missing_links(self) -> Dict[str, Any]:
        """
        Step 1: Scan.
        Finds isolated nodes or pattern gaps using Cypher.
        """
        missing_patterns = []
        
        with self.driver.session() as session:
            # 1. Events without Emotion (What did you feel?)
            result = session.run("""
                MATCH (p:Person)-[:EXPERIENCED]->(e:Event)
                WHERE NOT (e)-[:CAUSED]->(:Emotion)
                RETURN e.summary AS event, e.timestamp AS date
                LIMIT 1
            """)
            record = result.single()
            if record:
                missing_patterns.append({
                    "type": "missing_emotion",
                    "context": f"Event: {record['event']} ({record['date']})",
                    "target_node": "Emotion"
                })

            # 2. Skill without Origin (How did you learn this?)
            result = session.run("""
                MATCH (p:Person)-[:HAS_SKILL]->(s:Skill)
                WHERE NOT (s)<-[:RELATED_TO]-(:Event) AND NOT (s)<-[:RELATED_TO]-(:Organization)
                RETURN s.name AS skill
                LIMIT 1
            """)
            record = result.single()
            if record:
                missing_patterns.append({
                    "type": "missing_origin",
                    "context": f"Skill: {record['skill']}",
                    "target_node": "Event/Organization"
                })

             # 3. Organization without Role/Period (What did you do?)
            result = session.run("""
                MATCH (p:Person)-[r:BELONGS_TO]->(o:Organization)
                WHERE r.role IS NULL
                RETURN o.name AS org
                LIMIT 1
            """)
            record = result.single()
            if record:
                missing_patterns.append({
                    "type": "missing_role",
                    "context": f"Organization: {record['org']}",
                    "target_node": "Role Property"
                })

        # Return the first found issue for focused questioning
        return missing_patterns[0] if missing_patterns else None

    def generate_question(self, gap_info: Dict[str, Any]) -> str:
        """
        Step 2: Generate Question.
        """
        if not gap_info:
            return "요즘 특별히 신경 쓰이는 일이나 새로운 관심사가 있으신가요?" # Default Generic Question

        prompt = f"""
        You are an empathetic 'Interviewer Agent' for a Personal Knowledge Graph.
        Your goal is to fill a missing link in the user's graph.
        
        Missing Info: {gap_info['type']}
        Context: {gap_info['context']}
        Target: Need to connect this to a '{gap_info['target_node']}'.

        Generate a natural, friendly, and short question (in Korean) to ask the user.
        Do not be robotic. Be like a curious friend or therapist.
        
        Example for missing emotion: "그때 삼성전자에 입사했을 때, 기분이 어땠어? 설렜니 아니면 걱정됐니?"
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating question: {e}")
            return "그 일에 대해 좀 더 자세히 이야기해 줄 수 있어?"

    def get_proactive_question(self) -> str:
        """
        Orchestration method.
        """
        gap = self.scan_for_missing_links()
        question = self.generate_question(gap)
        return question

if __name__ == "__main__":
    # Test
    agent = ActiveInterviewer()
    q = agent.get_proactive_question()
    print(f"Agent Question: {q}")
    agent.close()
