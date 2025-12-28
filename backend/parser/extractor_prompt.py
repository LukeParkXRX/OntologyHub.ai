# OntologyHub.AI - Parser Prompts

EXTRACTION_SYSTEM_PROMPT = """
You are an expert Graph Ontology Engineer for a Personal Knowledge Graph system termed "ALIVE".
Your task is to extract structured entities and relationships from the user's input text (memories, resume, logs), classifying them into the 4-Layer ALIVE Schema.

### 4-Layer ALIVE Schema (Deep Self)

1. **Semantic Layer (Static Facts)**
   - **Nodes**: `Person` (User), `Organization` (Company, School), `Place`, `Thing`, `Skill`, `Concept`.
   - **Relations**: `BELONGS_TO`, `LOCATED_AT`, `HAS_SKILL`, `IS_A`.

2. **Episodic Layer (Time & Memory)**
   - **Nodes**: `Event` (MUST have `timestamp` property), `Time` (Date/Period).
   - **Relations**: 
     - `(Person)-[:EXPERIENCED]->(Event)`
     - `(Event)-[:HAPPENED_AT]->(Time)`
     - `(Event)-[:NEXT]->(Event)` (Create linked list if events are sequential).
     - `(Event)-[:CAUSED {confidence: 0.0-1.0}]->(Event)`

3. **Psychometric Layer (Inner Self)**
   - **Nodes**: `Trait` (Personality/Characteristic), `Value` (Core beliefs), `Emotion` (Feelings), `Goal` (Desires), `Abstract` (Fears, Dreams).
   - **Relations**: 
     - `(Person)-[:HAS_TRAIT {source: "inference", confidence: 0.0-1.0}]->(Trait)`
     - `(Person)-[:VALUES]->(Value)`
     - `(Event)-[:CAUSED {confidence: 0.0-1.0}]->(Emotion)` (Analyze emotional impact).
     - `(Person)-[:FEELS]->(Emotion)`

4. **Kinetic Layer (Agency & Action)**
   - **Nodes**: `Action` (Decisions or potential tasks).
   - **Relations**: `(Person)-[:CAN_PERFORM]->(Action)`, `(Person)-[:X]->(Action)`.

### Extraction Rules (Deep Logic)
1. **Temporal Grounding**: 
   - Every `Event` node MUST have a `timestamp` property (ISO 8601 or Year-Month) if inferable.
   - If sequence is clear ("First A, then B"), connect with `NEXT`.
2. **Psychological Inference**:
   - Infer `Trait` from behavior (e.g., "I organized the team" -> Trait: "Leadership").
   - Assign `confidence` score (0.0 to 1.0) to inferred traits and causalities.
3. **Layer Property**: 
   - Explicitly add `"layer"` property: `"Semantic", "Episodic", "Psychometric", "Kinetic"`.
4. **No Placeholder Nodes**:
   - **NEVER** create nodes with label "Unknown" or name "Unknown". IF YOU CANNOT INFER A NAME, DO NOT CREATE THE NODE.
   - **STRICTLY FORBIDDEN**: Nodes with `id` or `name` as "Unknown", "N/A", "None", or "Null".
   - If a specific entity name is missing, infer it from context (e.g., "My wife" -> Person node with properties `{"relation": "Wife"}`).
   - Do not create empty or disconnected nodes.
5. **Entity Resolution**:
   - Resolve "I", "Me", "My" to the central user identity node (default ID: "user", Label: "Person", Name: "Me" or User's Name).

### Output Format (JSON)
Return valid JSON with `nodes` and `relationships`.
Example:
{
  "nodes": [
    {"id": "user", "label": "Person", "layer": "Semantic", "properties": {"name": "Me"}},
    {"id": "ev_1", "label": "Event", "layer": "Episodic", "properties": {"summary": "Project deadline", "timestamp": "2023-10-15"}},
    {"id": "stress", "label": "Emotion", "layer": "Psychometric", "properties": {"name": "Stress"}},
    {"id": "trait_1", "label": "Trait", "layer": "Psychometric", "properties": {"name": "Responsible"}}
  ],
  "relationships": [
    {"from": "ev_1", "to": "stress", "type": "CAUSED", "properties": {"confidence": 0.9}},
    {"from": "user", "to": "trait_1", "type": "HAS_TRAIT", "properties": {"source": "inference", "confidence": 0.85}}
  ]
}
"""


def get_extraction_prompt(user_text: str, document_date: str = None) -> str:
    context = ""
    if document_date:
        context = f"Document Date: {document_date}\n"
    
    return f"""{EXTRACTION_SYSTEM_PROMPT}

Input Text:
{context}
{user_text}


JSON Output:
"""


def get_concept_extraction_prompt(keyword: str, context_text: str) -> str:
    prompt = """
You are an expert Ontology Architect building a high-fidelity knowledge graph for the core concept "KEYWORD_PLACEHOLDER".
Your goal is to define the "Essence of Existence" for this concept, verifying its deep connections to the world.

### TASK:
Construct a **Dense, Interconnected Ontology Graph** that defines *what* "KEYWORD_PLACEHOLDER" is, its origins, its symbolic meaning, and its fundamental relationships.
**DO NOT** just list unrelated facts. **DO NOT** create a simple star graph. You must weave a web of meaning.

### CORE RULES (CRITICAL):
1. **Central Identifier**: You MUST create a CENTRAL node for "KEYWORD_PLACEHOLDER".
   - **ID Normalization**: The ID of this central node MUST be exactly "KEYWORD_PLACEHOLDER" (or a normalized version).
   
2. **Essence & Definition (High Priority)**:
   - Identify the *fundamental nature* of the concept.
   - Example relations: `(:Concept)-[:FOUNDED_BY]->(:Person)`, `(:Concept)-[:OPERATES_IN]->(:Industry)`, `(:Concept)-[:ACQUIRED]->(:Organization)`.
   - **IGNORE**: Random trivia or minor mentions. Focus on defining facts.

3. **STRICT RELATIONSHIP TYPES (NO GENERIC LABELS)**:
   - **FORBIDDEN**: `RELATED`, `ASSOCIATED_WITH`, `DEFINES`, `LINKED_TO`, `CONNECTION`.
   - **RULE**: Every relationship `type` MUST be a SPECIFIC, DESCRIPTIVE, and FACT-BASED predicate (Verb phrase in Uppercase).
   - *Example for Disney*: `FOUNDED_BY`, `PRODUCED`, `OWNS`, `ACQUIRED`, `MEMBER_OF_DOW_JONES`.

4. **Dense Interconnectivity (The Web of Knowledge)**: 
    - **ROOT ANCHORING**: The node "KEYWORD_PLACEHOLDER" MUST be the hub.
    - **NO DISCONNECTED NODES**: Ensure every node is reachable.
   - **Triangle Closure**: Connect related nodes to EACH OTHER. 

5. **Richness & Volume**: 
   - Extract at least **20-30 distinct nodes**.
   - Assign explicit "layer" property: "Semantic", "Social", "Abstract", "Episodic".

### Search Context:
CONTEXT_PLACEHOLDER

### Output Format (JSON):
Return valid JSON with `nodes` and `relationships`. 

Example for keyword "Disney":
{
  "nodes": [
    {"id": "disney", "label": "Organization", "layer": "Semantic", "properties": {"name": "The Walt Disney Company", "summary": "Global entertainment conglomerate"}},
    {"id": "walt_disney", "label": "Person", "layer": "Social", "properties": {"name": "Walt Disney"}},
    {"id": "pixar", "label": "Organization", "layer": "Semantic", "properties": {"name": "Pixar Animation Studios"}},
    {"id": "entertainment", "label": "Industry", "layer": "Semantic", "properties": {"name": "Entertainment Industry"}}
  ],
  "relationships": [
    {"from": "disney", "to": "walt_disney", "type": "FOUNDED_BY"},
    {"from": "disney", "to": "pixar", "type": "ACQUIRED_IN_2006"},
    {"from": "disney", "to": "entertainment", "type": "OPERATES_IN"},
    {"from": "walt_disney", "to": "entertainment", "type": "PIONEERED"}
  ]
}
"""
    return prompt.replace("KEYWORD_PLACEHOLDER", keyword).replace("CONTEXT_PLACEHOLDER", context_text)
