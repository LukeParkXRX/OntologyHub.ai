
import networkx as nx
import math

def enrich_graph_data(nodes: list, links: list) -> dict:
    """
    Analyzes the graph structure using NetworkX to calculate node importance (centrality)
    and detect communities (topic clusters).
    
    Args:
        nodes: List of node dictionaries [{'id': '...', 'label': '...', ...}]
        links: List of link dictionaries [{'source': '...', 'target': '...'}]
        
    Returns:
        Dictionary with enriched nodes and links.
    """
    if not nodes or not links:
        return {"nodes": nodes, "links": links}

    # 1. Build NetworkX Graph
    G = nx.Graph()
    
    node_map = {n['id']: n for n in nodes}
    
    for n in nodes:
        G.add_node(n['id'])
        
    for l in links:
        src = l.get('source')
        tgt = l.get('target')
        # Handle cases where source/target might be objects (if re-processing) or strings
        src_id = src['id'] if isinstance(src, dict) else src
        tgt_id = tgt['id'] if isinstance(tgt, dict) else tgt
        
        if src_id in node_map and tgt_id in node_map:
            G.add_edge(src_id, tgt_id)

    # 2. Calculate Centrality (Importance -> Size)
    # Using PageRank as a proxy for importance.
    # Fallback to Degree Centrality if PageRank fails (e.g., convergence issues)
    try:
        centrality = nx.pagerank(G, alpha=0.85)
    except Exception:
        centrality = nx.degree_centrality(G)

    # Normalize centrality to a useful scale for UI 'val' (e.g., 1 ~ 10)
    # Finding min/max
    vals = list(centrality.values())
    if vals:
        min_v, max_v = min(vals), max(vals)
        range_v = max_v - min_v if max_v > min_v else 1.0
        
        for n_id, score in centrality.items():
            # Scale 0.0-1.0 to 1-10 range roughly, but keep baseline
            # UI expects 'val' for radius. Let's make it additive.
            # Base size 2, max add 8.
            normalized_score = (score - min_v) / range_v
            # Logarithmic scaling serves better for power-law graphs
            size_boost = math.log(1 + normalized_score * 10) * 3 
            
            if n_id in node_map:
                node_map[n_id]['val'] = 2 + size_boost
                # Store raw centrality for filtering
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
