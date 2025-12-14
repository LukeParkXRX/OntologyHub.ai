from pydantic import BaseModel
from typing import List, Optional

# Node Labels
LABEL_CONCEPT = "Concept"
LABEL_ENTITY = "Entity"
LABEL_ACTION = "Action"
LABEL_RESOURCE = "Resource"

# Relationship Types
REL_RELATED_TO = "RELATED_TO"
REL_PART_OF = "PART_OF"
REL_IS_A = "IS_A"

class GraphNode(BaseModel):
    id: str
    label: str
    description: Optional[str] = None
    embedding: Optional[List[float]] = None
    last_accessed: Optional[str] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    type: str
    weight: float = 1.0
