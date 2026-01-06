from .registry import Action, ActionType

class KineticLayer:
    """
    The Kinetic Layer handles the 'ripples' or side-effects of an action.
    It reacts to changes in the graph.
    """
    
    def __init__(self, neo4j_ingestor=None):
        self.ingestor = neo4j_ingestor
        # In a real app, this might track state or have access to a repository
        self.recent_events = [] 

    def process_action(self, action: Action, validation_passed: bool):
        if not validation_passed:
            print(f"Action {action.type.value} rejected due to validation errors.")
            return

        print(f"Executing Kinetic Logic for: {action.type.value}")
        
        # 1. Basic Effect: Update 'Last Updated' timestamp on User (Simulation)
        self._update_user_timestamp(action.user_id)

        # 2. Complex Trigger: Stress Detection
        if action.type == ActionType.ADD_EVENT:
            sentiment = action.payload.get("sentiment", "Neutral")
            self.recent_events.append(sentiment)
            
            # Keep only last 3
            if len(self.recent_events) > 3:
                self.recent_events.pop(0)

            self._check_stress_trigger(action.user_id)

    def _update_user_timestamp(self, user_id: str):
        # Cypher query to update person would go here
        print(f"  -> [Kinetic] Updated timestamp for user: {user_id}")

    def _check_stress_trigger(self, user_id: str):
        # If last 3 events were Negative, trigger High Stress mode
        if len(self.recent_events) == 3 and all(s == "Negative" for s in self.recent_events):
            print(f"  -> [TRIGGER] 🚨 High Stress Detected for {user_id}! Initiating 'Healing Music' recommendation protocol...")
            # Here we could call an external API or create a 'Condition' node in Neo4j
