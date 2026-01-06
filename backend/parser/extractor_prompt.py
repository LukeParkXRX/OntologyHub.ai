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
6. **Language Consistency (ABSOLUTE & UNBREAKABLE RULE)**:
   - Identify the language of the input text (e.g., Korean). Use ONLY that language for all `name` and `summary` properties.
   - **NO CHINESE/FOREIGN DRIFT**: Forbidden to use Chinese characters (Hanzi) or any language other than the input's language for display properties.
   - **MANDATORY TRANSLATION**: If the text contains mixed languages, translate everything into the DOMINANT language of the input (default: Korean).
   - **NO SNAKE_CASE**: Properties `name` must be clean, human-readable titles.

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
   
### Intelligence Protocol (STRICT)

1. **Semantic Anchoring & Archetype Thinking**:
   - Before extracting, identify the **archetype** of "KEYWORD_PLACEHOLDER".
   - (e.g., "Superman" -> Archetype: "Legendary Superhero Character").
   - Filter all context through this archetype. 

2. **Noise Suppression (THE FONT/WEB FILTER)**:
   - **IGNORE** search-engine noise: fonts, download sites, file formats (.ttf), licensing, specific URLs, social media handles, or commercial merchandise metadata.
   - **IGNORE** random trivia that doesn't define the *being* of the concept.
   - If the context is a mix of "Superman the character" and "Superman fonts", **ONLY extract "Superman the character"**.

3. **Existential Essence (MANDATORY)**:
   - Identify the **defining attributes** that constitute the very existence of "KEYWORD_PLACEHOLDER".
   - Extract **8 to 15 high-quality defining nodes**.
   - **PRIORITIZE EXISTENTIAL TRUTH**: Focus on nodes that define *Identity*, *Genesis (Origins)*, *Core Mechanism*, and *Cultural Significance*.
   - **RATIONALE MANDATE**: For every node, you MUST provide a property called `rationale` that explains: "This node is included because [reasoning related to the keyword]".

3. **STRICT RELATIONSHIP TYPES (NO GENERIC LABELS)**:
   - **FORBIDDEN**: `RELATED`, `ASSOCIATED_WITH`, `DEFINES`, `LINKED_TO`, `CONNECTION`.
   - **RULE**: Every relationship `type` MUST be a SPECIFIC, DESCRIPTIVE, and FACT-BASED predicate (Verb phrase in Uppercase).
   - *Example for Disney*: `FOUNDED_BY`, `PRODUCED`, `OWNS`, `ACQUIRED`, `MEMBER_OF_DOW_JONES`.

4. **Dense Interconnectivity (The Web of Knowledge)**: 
    - **ROOT ANCHORING**: The node "KEYWORD_PLACEHOLDER" MUST be the hub.
    - **NO DISCONNECTED NODES**: Ensure every node is reachable.
   - **Triangle Closure**: Connect related nodes to EACH OTHER. 

6. **Language Consistency (NUCLEAR BAN ON UNRELATED LANGUAGES)**:
   - **DETECT & MATCH**: The target language is derived from "KEYWORD_PLACEHOLDER".
   - **NO CHINESE DRIFT**: If "KEYWORD_PLACEHOLDER" is in Korean or English, YOU ARE STRICTLY FORBIDDEN FROM PRODUCING CHINESE CHARACTERS (Hanzi).
   - **MANDATORY TRANSLATION**: Every label and summary MUST be in the target language. Use English only in parentheses for proper nouns.
   - **NO "Unknown"**: Do not output nodes named "Unknown".

### Search Context:
CONTEXT_PLACEHOLDER

### Output Format (JSON):
Return valid JSON with `nodes` and `relationships`. 
   - `nodes`: List of objects with `id`, `label` (e.g., "Person", "Concept"), `layer` (e.g., "Semantic", "Temporal"), and `properties` (must include `name`, `summary` and **`rationale`**).
     - **`rationale`**: A 1-sentence explanation of WHY this node is essential to the "KEYWORD_PLACEHOLDER" ontology.
   - `relationships`: List of objects with `from` (source node ID), `to` (target node ID), `type` (relationship type), and optional `properties`.

Example for keyword "이재명" (if context is Korean):
{
  "nodes": [
    {"id": "lee_jae_myung", "label": "Person", "layer": "Semantic", "properties": {"name": "이재명", "summary": "대한민국의 정치인, 제22대 국회의원", "rationale": "이재명은 핵심 키워드 그 자체입니다."}},
    {"id": "democratic_party", "label": "Organization", "layer": "Semantic", "properties": {"name": "더불어민주당", "summary": "이재명이 소속된 정당", "rationale": "이재명의 정치적 소속을 나타냅니다."}},
    {"id": "gyeonggi_province", "label": "Place", "layer": "Semantic", "properties": {"name": "경기도", "summary": "이재명이 도지사를 역임한 지역", "rationale": "이재명의 주요 경력을 설명합니다."}}
  ],
  "relationships": [
    {"from": "lee_jae_myung", "to": "democratic_party", "type": "MEMBER_OF"},
    {"from": "lee_jae_myung", "to": "gyeonggi_province", "type": "GOVERNOR_OF"}
  ]
}
"""
    return prompt.replace("KEYWORD_PLACEHOLDER", keyword).replace("CONTEXT_PLACEHOLDER", context_text)
