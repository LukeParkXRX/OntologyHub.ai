
import networkx as nx
import math

def enrich_graph_data(nodes: list, links: list, root_id: str = None) -> dict:
    """
    Analyzes the graph structure using NetworkX to calculate node importance (centrality)
    and detect communities (topic clusters).
    """
    if not nodes or not links:
        return {"nodes": nodes, "links": links}

    # 1. Build NetworkX Graph
    G = nx.Graph()
    node_map = {n['id']: n for n in nodes}
    
    # [ALIVE] Find best root match if provided
    actual_root_id = None
    
    # 0. Priority: Look for explicit 'isRoot' property in nodes
    for nid, node in node_map.items():
        if node.get('properties', {}).get('isRoot') == True or node.get('isRoot') == True:
            actual_root_id = nid
            print(f"[NetworkStats] Found explicit root node by flag: {nid}")
            break

    if not actual_root_id and root_id:
        rid = root_id.lower().strip().replace(" ", "_")
        print(f"[NetworkStats] Searching for root node for keyword: '{rid}'")
        
        # 1. Try exact match by ID
        if rid in node_map:
            actual_root_id = rid
            print(f"[NetworkStats] Found exact root by ID: {actual_root_id}")
        else:
            # 2. Try semantic match
            for nid, node in node_map.items():
                name = str(node.get('name', '')).lower()
                topic = str(node.get('topic', '')).lower()
                nid_str = str(nid).lower()
                if (rid in name or rid in topic or rid in nid_str or 
                    name in rid or topic in rid or nid_str in rid):
                    actual_root_id = nid
                    print(f"[NetworkStats] Found semantic root: ID={nid}, Name={name}")
                    break
    for n in nodes:
        G.add_node(n['id'])
        
    for l in links:
        src = l.get('source')
        tgt = l.get('target')
        src_id = src['id'] if isinstance(src, dict) else src
        tgt_id = tgt['id'] if isinstance(tgt, dict) else tgt
        
        if src_id in node_map and tgt_id in node_map:
            G.add_edge(src_id, tgt_id)

    # 2. Calculate Centrality
    try:
        centrality = nx.pagerank(G, alpha=0.85)
    except Exception:
        centrality = nx.degree_centrality(G)

    vals = list(centrality.values())
    if vals:
        min_v, max_v = min(vals), max(vals)
        range_v = max_v - min_v if max_v > min_v else 1.0
        
        for n_id, score in centrality.items():
            if n_id in node_map:
                # Force maximum size for Root Node
                if n_id == actual_root_id:
                    node_map[n_id]['val'] = 15 # Hero size
                    node_map[n_id]['isRoot'] = True
                    node_map[n_id]['centrality'] = 1.0
                else:
                    normalized_score = (score - min_v) / range_v
                    size_boost = math.log(1 + normalized_score * 8) * 2.5 
                    node_map[n_id]['val'] = 2 + size_boost
                    node_map[n_id]['centrality'] = score

    # 3. Detect Communities (Topics -> Color Group)
    # Using Greedy Modularity Communities (Built-in NX)
    # Returns list of sets of nodes
    try:
        communities = nx.community.greedy_modularity_communities(G)
        
        for group_id, community_set in enumerate(communities):
            for n_id in community_set:
                if n_id in node_map:
                    node_map[n_id]['group'] = group_id + 1 # 1-based index for safety
    except Exception as e:
        # Fallback: single group if detection fails
        print(f"Community detection failed: {e}")
        for n in nodes:
            n['group'] = 1

    return {"nodes": list(node_map.values()), "links": links}

def filter_connected_component(nodes: list, links: list, root_id: str = None) -> dict:
    """
    Filters the graph to keep only the Largest Connected Component (LCC),
    OR the component containing the root_id if provided.
    """
    if not nodes or not links:
        return {"nodes": nodes, "links": links}

    G = nx.Graph()
    node_map = {n['id']: n for n in nodes}
    
    # [ALIVE] 1. Find the actual internal ID of the root node
    actual_root_nid = None
    
    # Priority A: isRoot flag
    for nid, node in node_map.items():
        if node.get('properties', {}).get('isRoot') == True or node.get('isRoot') == True:
            actual_root_nid = nid
            break
            
    # Priority B: Semantic match if root_id string provided
    if not actual_root_nid and root_id:
        rid = root_id.lower().strip().replace(" ", "_")
        for nid, node in node_map.items():
            name = str(node.get('name', '')).lower()
            topic = str(node.get('topic', '')).lower()
            # Some IDs might be semantic
            if rid == nid or rid in name or rid in topic:
                actual_root_nid = nid
                break
    
    # 2. Build NetworkX Graph
    for n in nodes:
        G.add_node(n['id'])
    for l in links:
        src_id = l.get('source')['id'] if isinstance(l.get('source'), dict) else l.get('source')
        tgt_id = l.get('target')['id'] if isinstance(l.get('target'), dict) else l.get('target')
        if src_id in node_map and tgt_id in node_map:
            G.add_edge(src_id, tgt_id)
            
    if nx.is_empty(G):
        return {"nodes": nodes, "links": links}
        
    components = list(nx.connected_components(G))
    target_component = None
    
    # 3. Select Target Component
    if actual_root_nid:
        for component in components:
            if actual_root_nid in component:
                target_component = component
                print(f"[NetworkStats] Found Root '{actual_root_nid}' in component of size {len(component)}")
                break
    
    if not target_component:
        target_component = max(components, key=len)
        print(f"[NetworkStats] No Root found. Using LCC of size {len(target_component)}")
    
    filtered_nodes = [n for n in nodes if n['id'] in target_component]
    filtered_links = []
    for l in links:
        src_id = l.get('source')['id'] if isinstance(l.get('source'), dict) else l.get('source')
        tgt_id = l.get('target')['id'] if isinstance(l.get('target'), dict) else l.get('target')
        if src_id in target_component and tgt_id in target_component:
            filtered_links.append(l)
            
    print(f"Final Graph: {len(nodes)} -> {len(filtered_nodes)} nodes.")
    return {"nodes": filtered_nodes, "links": filtered_links}
