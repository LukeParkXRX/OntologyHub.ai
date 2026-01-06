from datetime import datetime
from typing import List, Tuple
from .registry import Action, ActionType

class ActionValidator:
    """
    Validates actions against business rules before they are executed.
    """
    
    def validate(self, action: Action) -> Tuple[bool, List[str]]:
        errors = []
        
        if action.type == ActionType.UPDATE_JOB_STATUS:
            errors.extend(self._validate_dates(action.payload))
            
        elif action.type == ActionType.ADD_EVENT:
             if not action.payload.get("summary"):
                 errors.append("Event summary is required.")
        
        return (len(errors) == 0, errors)

    def _validate_dates(self, payload: dict) -> List[str]:
        errs = []
        start_date = payload.get("start_date")
        end_date = payload.get("end_date")
        
        if start_date and end_date:
            try:
                # Simple ISO format check (YYYY-MM-DD)
                s_dt = datetime.fromisoformat(start_date)
                e_dt = datetime.fromisoformat(end_date)
                
                if e_dt < s_dt:
                    errs.append(f"End date ({end_date}) cannot be earlier than start date ({start_date}).")
            except ValueError:
                errs.append("Invalid date format. Use ISO format (YYYY-MM-DD).")
                
        return errs
