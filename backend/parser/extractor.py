import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from .extractor_prompt import get_extraction_prompt, get_concept_extraction_prompt

# Load environment variables
load_dotenv()

# Configure LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", # Latest stable and high performance
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0
)

parser = JsonOutputParser()

def extract_graph_elements(text: str, document_date: str = None) -> dict:
    """
    Extracts graph nodes and relationships from text using Google Gemini (LangChain).
    """
    try:
        raw_prompt = get_extraction_prompt(text, document_date)
        prompt = PromptTemplate.from_template("{input}")
        
        chain = prompt | llm | parser
        
        result = chain.invoke({"input": raw_prompt})
        return result
        
    except Exception as e:
        print(f"Error during extraction with Gemini: {e}")
        return {"nodes": [], "relationships": []}

def extract_concept_graph(keyword: str, context_text: str) -> dict:
    """
    Extracts concept ontology from web search context using Gemini (LangChain).
    """
    try:
        raw_prompt = get_concept_extraction_prompt(keyword, context_text)
        prompt = PromptTemplate.from_template("{input}")
        
        chain = prompt | llm | parser
        
        result = chain.invoke({"input": raw_prompt})
        
        if result is None:
            print("[Extractor] LLM returned None. Falling back to empty graph.")
            result = {"nodes": [], "relationships": []}
        
        if not isinstance(result, dict):
            print(f"[Extractor] LLM returned unexpected type: {type(result)}. Forcing dict.")
            result = {"nodes": [], "relationships": []}

        # Ensure keys exist
        if 'nodes' not in result: result['nodes'] = []
        if 'relationships' not in result: result['relationships'] = []

        # [ALIVE FIX] Post-processing to enforce "One Graph"
        # 1. Normalize ALL node IDs to lowercase to ensure merging (Deduplication).
        # 2. Preserve original casing in 'name' property for display.
        
        normalized_keyword = keyword.lower().strip()
        id_map = {} # old_id -> new_id
        
        # First Pass: Normalize Node IDs
        for node in result.get('nodes', []):
            original_id = str(node.get('id', '')).strip()
            if not original_id: continue
            
            # Normalize ID: lowercase, stripped, and replace spaces with underscores for stability
            new_id = original_id.lower().strip().replace(" ", "_")
            
            # Preserve display name if not present
            if 'name' not in node or not node['name']:
                node['name'] = original_id # Keep 'Superman' (case) as name, 'superman' (lower) as ID
            
            id_map[original_id] = new_id
            node['id'] = new_id
            
            # Mark central node
            if new_id == normalized_keyword:
                node['group'] = 0 # Root
                node['val'] = 10
                
        # Second Pass: Update Relationships & Standardize Keys
        cleaned_relationships = []
        for rel in result.get('relationships', []):
            try:
                # Handle variations in LLM output keys
                src = rel.get('source') or rel.get('from')
                tgt = rel.get('target') or rel.get('to')
                # Normalize rel_type (Uppercase + underscores for Cypher compatibility)
                raw_rel_type = rel.get('type') or rel.get('relationship') or "RELATED"
                rel_type = str(raw_rel_type).upper().strip().replace(" ", "_").replace("-", "_")
                
                if not src or not tgt: continue

                # Use mapped IDs or fallback to normalized string
                final_src = id_map.get(str(src), str(src).lower().strip().replace(" ", "_"))
                final_tgt = id_map.get(str(tgt), str(tgt).lower().strip().replace(" ", "_"))
                
                # Update relation object
                rel['source'] = final_src
                rel['target'] = final_tgt
                rel['type'] = rel_type
                
                # Remove old keys if present for cleaner output
                if 'from' in rel: del rel['from']
                if 'to' in rel: del rel['to']
                if 'relationship' in rel: del rel['relationship']
                
                cleaned_relationships.append(rel)

            except Exception as e:
                print(f"Skipping malformed relationship: {rel} - Error: {e}")
        
        result['relationships'] = cleaned_relationships
        
        # [ALIVE FIX] Hard-Injection of Root Node
        # Ensure a node with the keyword exists to guarantee centrality
        root_id_norm = keyword.lower().strip().replace(" ", "_")
        has_root = False
        target_node = None

        for n in result['nodes']:
            if str(n.get('id', '')).lower() == root_id_norm or \
               str(n.get('properties', {}).get('name', '')).lower() == keyword.lower():
                has_root = True
                target_node = n
                # Move to front
                result['nodes'].remove(n)
                result['nodes'].insert(0, n)
                break
        
        if not has_root:
            print(f"[Extractor] Root node '{root_id_norm}' missing. Injecting...")
            target_node = {
                "id": root_id_norm,
                "label": "Concept",
                "layer": "Semantic",
                "properties": {
                    "name": keyword, 
                    "summary": f"Central concept of {keyword}",
                    "isRoot": True # Explicitly flag as root
                }
            }
            result['nodes'].insert(0, target_node)
        
        # Ensure the target node has the isRoot and name properties
        if "properties" not in target_node: target_node["properties"] = {}
        target_node["properties"]["isRoot"] = True
        if "name" not in target_node["properties"]: target_node["properties"]["name"] = keyword

        # [ALIVE FIX] Aggressive Connectivity Enforcement (Cluster Bridging)
        # We must ensure every "island" of nodes is connected to the root.
        root_id = root_id_norm
        nodes = result['nodes']
        rels = result['relationships']
        
        if not nodes: return result
        
        # 1. Build adjacency list for current results
        adj = {n['id']: set() for n in nodes}
        for rel in rels:
            s, t = rel['source'], rel['target']
            if s in adj and t in adj:
                adj[s].add(t)
                adj[t].add(s)
        
        # 2. Find all connected components using BFS
        visited = set()
        components = []
        for n in nodes:
            nid = n['id']
            if nid not in visited:
                component = []
                queue = [nid]
                visited.add(nid)
                while queue:
                    curr = queue.pop(0)
                    component.append(curr)
                    for neighbor in adj.get(curr, []):
                        if neighbor not in visited:
                            visited.add(neighbor)
                            queue.append(neighbor)
                components.append(component)
        
        # 3. Bridge every component that doesn't have the root
        for comp in components:
            if root_id not in comp:
                # Pick the first node of this island and bridge it to root
                target_nid = comp[0]
                rels.append({
                    "source": root_id,
                    "target": target_nid,
                    "type": "ROOT_CONCEPT_OF"
                })

        return result
        
    except Exception as e:
        print(f"Error during concept extraction with Gemini: {e}")
        return {"nodes": [], "relationships": []}

if __name__ == "__main__":
    # Test run
    sample_text = "I joined Samsung Electronics in May 2020 as a Software Engineer. It was a great challenge."
    result = extract_graph_elements(sample_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
