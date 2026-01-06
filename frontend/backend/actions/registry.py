from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
import dataclasses

class ActionType(Enum):
    ADD_EVENT = "add_event"
    UPDATE_JOB_STATUS = "update_job_status"
    ADD_MEMORY = "add_memory"
    DETECT_STRESS = "detect_stress" # System triggered action

@dataclasses.dataclass
class Action:
    type: ActionType
    payload: Dict[str, Any]
    timestamp: str = dataclasses.field(default_factory=lambda: datetime.now().isoformat())
    user_id: str = "user_default" # Supporting single user for now

def create_action(action_type: str, payload: Dict[str, Any]) -> Action:
    try:
        a_type = ActionType(action_type)
        return Action(type=a_type, payload=payload)
    except ValueError:
        raise ValueError(f"Invalid action type: {action_type}")
