from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- 1. Layer Definitions ---

class LayerType(str, Enum):
    SEMANTIC = "Semantic"       # 정적 구조 (Static Structure)
    EPISODIC = "Episodic"       # 기억과 시간 (Memory & Time)
    PSYCHOMETRIC = "Psychometric" # 내면 (Inner Self)
    KINETIC = "Kinetic"         # 행동 (Action)

# --- 2. Node Types per Layer ---

class NodeType(str, Enum):
    # Semantic Layer
    PERSON = "Person"
    ORGANIZATION = "Organization"
    PLACE = "Place"
    THING = "Thing"
    SKILL = "Skill"
    CONCEPT = "Concept"
    
    # Episodic Layer
    EVENT = "Event"
    TIME = "Time"
    
    # Psychometric Layer
    VALUE = "Value"       # 가치관 (e.g., 정직, 도전)
    EMOTION = "Emotion"   # 감정 (e.g., 기쁨, 불안)
    GOAL = "Goal"         # 목표/욕망 (e.g., 부자되기, 평화)
    TRAIT = "Trait"       # 성격/특성 (e.g., 외향적, 꼼꼼함) - [NEW] for Deep Self
    
    # Kinetic Layer
    ACTION = "Action"     # 행동 (e.g., 예약, 검색, 메일전송)

# --- 3. Relationship Types (ALIVE Philosophy) ---

class RelationType(str, Enum):
    # Semantic (General)
    IS_A = "IS_A"
    PART_OF = "PART_OF"
    RELATED_TO = "RELATED_TO"
    KNOWS = "KNOWS"             # Person-Person
    BELONGS_TO = "BELONGS_TO"   # Person-Org
    LOCATED_AT = "LOCATED_AT"
    HAS_SKILL = "HAS_SKILL"
    
    # Episodic (Time & Experience)
    HAPPENED_AT = "HAPPENED_AT" # Event-Time
    EXPERIENCED = "EXPERIENCED" # Person-Event
    CAUSED = "CAUSED"           # Event-Event or Event-Emotion (Inference)
    NEXT = "NEXT"               # Event-Event (Time Linked List) - [NEW]
    
    # Psychometric (Inner Self)
    VALUES = "VALUES"           # Person-Value (중요시하다)
    FEARS = "FEARS"             # Person-Abstract (두려워하다)
    DESIRES = "DESIRES"         # Person-Goal (원하다)
    FEELS = "FEELS"             # Person-Emotion (느끼다)
    HAS_TRAIT = "HAS_TRAIT"     # Person-Trait (Infered Personality) - [NEW]
    
    # Kinetic (Agency)
    CAN_PERFORM = "CAN_PERFORM" # Person-Action
    TRIGGERED_BY = "TRIGGERED_BY" # Action-Event

# --- 4. Schema Models ---

class Node(BaseModel):
    id: str = Field(..., description="Unique Identifier (e.g., Name or UUID)")
    label: NodeType = Field(..., description="Type of the node")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Attributes like age, mbti, importance")
    layer: LayerType = Field(..., description="Which ALIVE layer this belongs to")

    class Config:
        use_enum_values = True

class Relationship(BaseModel):
    source: str = Field(..., description="ID of source node")
    target: str = Field(..., description="ID of target node")
    type: RelationType = Field(..., description="Type of relationship")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Edge attributes (e.g., weight, timestamp, confidence, source)")

class GraphSchema(BaseModel):
    nodes: List[Node]
    relationships: List[Relationship]
