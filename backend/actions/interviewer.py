import random
from typing import List, Dict, Any

class GenesisInterviewer:
    """
    The 'Genesis' agent responsible for bootstrapping the user's Digital Soul.
    It initiates the conversation when the graph is empty or lacks core identity markers.
    """
    
    def __init__(self):
        self.genesis_questions = [
            "Hello, Traveler! 🌌 Let's build your Digital Soul. First, what should I call you?",
            "Nice to meet you. To start understanding you, what is one thing you are most passionate about right now? (e.g., AI, Coffee, Music)",
            "What is your MBTI type? (Or describe your personality in 3 words)",
            "What do you do for a living, or what is your main role in life?"
        ]
    
    def determine_next_question(self, user_node: Dict[str, Any], graph_stats: Dict[str, Any]) -> str:
        """
        Decides the next question based on the current state of the 'Me' node.
        """
        if not user_node:
            # Phase 1: Genesis (Identification)
            return self.genesis_questions[0]
        
        props = user_node.get("properties", {})
        
        # Phase 2: Core Attribute Filling
        if "core_value" not in props and "value" not in props:
            return self.genesis_questions[1]
        
        if "trait" not in props and "mbti" not in props:
             return self.genesis_questions[2]
             
        if "occupation" not in props and "job" not in props:
            return self.genesis_questions[3]
            
        # Phase 3: Structural Gaps (The Life OS Logic)
        # Check for missing connections based on existing nodes
        # We assume graph_stats contains keys like 'event_count', 'emotion_count', etc.
        # This requires the server to pass these stats.
        
        event_count = graph_stats.get("Event", 0)
        emotion_count = graph_stats.get("Emotion", 0)
        skill_count = graph_stats.get("Skill", 0)
        
        # Gap 1: Temporal but Flat (Events without Emotions)
        if event_count > 0 and emotion_count == 0:
            return f"{props.get('name', 'Friend')}, you have shared some memories (Events). But I don't see how they impacted you. Pick one memory and tell me: How did it make you feel?"

        # Gap 2: Skilled but Idle (Skills without Projects/Experience)
        if skill_count > 0:
            # Simple probabilistic trigger
            if random.random() > 0.5:
                return "You have listed your skills. Can you describe a specific project or challenge where you applied these abilities?"

        # Phase 4: Deepening (Reflective)
        return self.generate_deep_question(props)

    def generate_deep_question(self, props: Dict[str, Any]) -> str:
        name = props.get("name", "Traveler")
        templates = [
            f"I see you are {name}. But what represents your 'Shadow' - the part of you that you hide?",
            "If your life was a book, what would be the title of the current chapter?",
            "Tell me about a turning point in your life (an Event) that changed your values.",
            "What is your biggest fear or abstract goal?"
        ]
        return random.choice(templates)
