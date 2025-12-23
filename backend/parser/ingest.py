import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

# Use 'ssc' if needed based on our troubleshooting
URI = os.getenv("NEO4J_URI", "neo4j+ssc://localhost:7687") 
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

class Neo4jIngestor:
    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)

    def close(self):
        self.driver.close()

    def ingest_data(self, graph_data: dict):
        with self.driver.session() as session:
            # 1. Merge Nodes
            for node in graph_data.get("nodes", []):
                session.execute_write(self._merge_node, node)
            
            # 2. Merge Relationships
            for rel in graph_data.get("relationships", []):
                session.execute_write(self._merge_relationship, rel)

    @staticmethod
    def _merge_node(tx, node_data):
        label = node_data.get("label")
        props = node_data.get("properties", {})
        
        # Construct Cypher dynamically based on properties
        # Ideally, we should use a unique key. For 'Person', it's 'email' or 'name'. 
        # For simplicity in this generic ingestor, we rely on a generated ID or primary key if available.
        # But 'MERGE' requires a unique constraint key.
        
        # Strategy:
        # - If Label is Person, MERGE by name (since we don't have email in extraction usually).
        # - If Label is Organization, MERGE by name.
        # - If Label is Event, MERGE by Summary + Date? Or Create new? 
        #   Let's assume we create new Events usually, but MERGE Org/Person/Skills.
        
        if label == "Person":
            query = """
            MERGE (n:Person {name: $props.name})
            SET n += $props
            """
        elif label == "Organization":
            query = """
            MERGE (n:Organization {name: $props.name})
            SET n += $props
            """
        elif label == "Skill":
            query = """
            MERGE (n:Skill {name: $props.name})
            SET n += $props
            """
        elif label == "Interest":
            query = """
            MERGE (n:Interest {topic: $props.topic})
            SET n += $props
            """
        else:
            # Event or others, just CREATE to avoid complex matching logic for now
            # In a real system, we'd use a deterministic hash ID.
            query = """
            CREATE (n)
            SET n:$label
            SET n += $props
            """
            query = query.replace("$label", label) # Cypher parameter for label is tricky, simplified here

        # Note: This is a simplified ingestion logic. 
        # For production, we need strictly defined keys for MERGE.
        # Here we try to run generic merge if keys exist.
        
        if label != "Event": # Use specific MERGE queries above
             tx.run(query, props=props)
        else:
             # Event handling
             # We assume extraction provides an 'id' or we generate a random one?
             # For now, let's just create.
             tx.run(f"CREATE (n:{label}) SET n += $props", props=props)

    @staticmethod
    def _merge_relationship(tx, rel_data):
        # We need to find source and target nodes to connect.
        # This requires the nodes to have some unique ID from the extraction phase that we can match on.
        # But our simple extraction might not sync IDs with DB IDs.
        
        # Improved Strategy:
        # The extraction returns 'id' for nodes in the JSON list.
        # We should use those temporary IDs to match *within this transaction*.
        pass
        # Implementing effective graph ingestion requires tracking the node references.
        # The above approach of merging nodes individually loses the context of which node is which for relationships.
        
        # REVISED APPROACH:
        # We will assume unique names for Person/Org/Skill.
        # For Events, we might struggle. 
        # Let's rely on the extraction `id` being consistent in the JSON payload.
        
        # We will parse the whole JSON in one complex Cypher Query using UNWIND if possible, 
        # OR we do it in two passes:
        # 1. Create/Match nodes, store their DB IDs in a map (temp_id -> db_id).
        # 2. Create relationships using the map.

    def ingest_batch(self, graph_data: dict):
        """
        Ingests the whole batch in one transaction to maintain referential integrity using temp IDs from extraction.
        """
        node_count = len(graph_data.get("nodes", []))
        rel_count = len(graph_data.get("relationships", []))
        print(f"[Neo4jIngestor] Ingesting batch: {node_count} nodes, {rel_count} relationships.")
        
        with self.driver.session() as session:
            session.execute_write(self._ingest_batch_tx, graph_data)

    def _ingest_batch_tx(self, tx, data):
        # 1. Create Nodes and map extracted IDs to them
        # We'll just set the 'temp_id' property on nodes to match them, then remove it? 
        # Or just match by properties like Name for Person/Org.
        
        for node in data.get("nodes", []):
            lbl = node["label"]
            props = node.get("properties", {})
            nid = node["id"]
            layer = node.get("layer") # New: Extract layer info
            
            # Add temp_id to props for matching
            props["_temp_id"] = nid
            
            # Sanitize Labels (Handle spaces like "TV Drama")
            def sanitize(l):
                return f"`{l}`" if " " in l else l

            # 1. Define Primary Label & Key
            primary_label = sanitize(lbl)
            
            # 2. Build Extra Labels String (for SET clause vs CREATE clause)
            # CREATE (n:L1:L2) vs SET n:L2
            extra_labels_colon = ""
            extra_labels_set = ""
            if layer:
                sanitized_layer = sanitize(layer)
                extra_labels_colon = f":{sanitized_layer}"
                extra_labels_set = f", n:{sanitized_layer}"
            
            # 3. Construct Query
            if lbl in ["Person", "Organization", "Skill", "Interest"]:
                key_prop = "name"
                if lbl == "Interest": key_prop = "topic"
                
                if key_prop not in props: 
                    # Fallback to CREATE
                    full_labels = f":{primary_label}{extra_labels_colon}"
                    cypher = f"CREATE (n{full_labels}) SET n += $props"
                else:
                    # MERGE using ONLY Primary Label + Key
                    cypher = f"""
                    MERGE (n:{primary_label} {{{key_prop}: $props.{key_prop}}})
                    ON CREATE SET n += $props{extra_labels_set}
                    ON MATCH SET n += $props{extra_labels_set}
                    """
            
            elif lbl == "Concept":
                if "id" in props:
                    # Valid Concept MERGE
                    cypher = f"""
                    MERGE (n:Concept {{id: $props.id}})
                    ON CREATE SET n += $props{extra_labels_set}
                    ON MATCH SET n += $props{extra_labels_set}
                    """
                else:
                    full_labels = f":{primary_label}{extra_labels_colon}"
                    cypher = f"CREATE (n{full_labels}) SET n += $props"
            
            else:
                # Default (Event, etc) -> CREATE
                full_labels = f":{primary_label}{extra_labels_colon}"
                # For safety, try ID merge if present
                if "id" in props:
                     cypher = f"""
                     MERGE (n:{primary_label} {{id: $props.id}})
                     ON CREATE SET n += $props{extra_labels_set}
                     ON MATCH SET n += $props{extra_labels_set}
                     """
                else:
                     cypher = f"CREATE (n{full_labels}) SET n += $props"
            
            tx.run(cypher, props=props)

        # 2. Create Relationships matching by _temp_id
        for rel in data.get("relationships", []):
            from_id = rel["from"]
            to_id = rel["to"]
            rtype = rel["type"]
            rprops = rel.get("properties", {})
            
            cypher = f"""
            MATCH (a), (b)
            WHERE a._temp_id = $from_id AND b._temp_id = $to_id
            MERGE (a)-[r:{rtype}]->(b)
            SET r += $rprops
            """
            tx.run(cypher, from_id=from_id, to_id=to_id, rprops=rprops)
            
        # 3. Cleanup _temp_id (Optional, but good for cleanliness)
        tx.run("MATCH (n) WHERE n._temp_id IS NOT NULL REMOVE n._temp_id")

if __name__ == "__main__":
    # Test
    pass
