/**
 * Graph Utility Functions
 * 
 * Utilities for processing and validating knowledge graph data structures.
 * Includes deduplication, connectivity validation, and quality metrics.
 */

export interface GraphNode {
  data: {
    id: string;
    label: string;
    type?: string;
    [key: string]: any;
  };
}

export interface GraphEdge {
  data: {
    source: string;
    target: string;
    label: string;
    explanation?: string;
    [key: string]: any;
  };
}

export interface GraphData {
  elements: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for detecting similar node labels
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio between two strings (0 to 1)
 */
function similarityRatio(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Deduplicate nodes based on label similarity
 * Merges nodes with similar labels and updates edges accordingly
 * 
 * @param graphData - The graph data to deduplicate
 * @param similarityThreshold - Threshold for considering nodes as duplicates (0-1)
 * @returns Deduplicated graph data
 */
export function deduplicateNodes(
  graphData: GraphData,
  similarityThreshold: number = 0.85
): GraphData {
  const { nodes, edges } = graphData.elements;
  
  if (!nodes || nodes.length === 0) {
    return graphData;
  }

  // Map to track node ID changes (old ID -> new ID)
  const idMapping: Map<string, string> = new Map();
  const deduplicatedNodes: GraphNode[] = [];
  const processedLabels: Set<string> = new Set();

  // Group similar nodes
  for (const node of nodes) {
    const nodeLabel = node.data.label.toLowerCase().trim();
    
    // Check if this node is similar to any already processed node
    let foundSimilar = false;
    
    for (const existingNode of deduplicatedNodes) {
      const existingLabel = existingNode.data.label.toLowerCase().trim();
      const similarity = similarityRatio(nodeLabel, existingLabel);
      
      if (similarity >= similarityThreshold) {
        // Map this node's ID to the existing node's ID
        idMapping.set(node.data.id, existingNode.data.id);
        foundSimilar = true;
        break;
      }
    }
    
    if (!foundSimilar) {
      // This is a unique node, add it to deduplicated list
      deduplicatedNodes.push(node);
      idMapping.set(node.data.id, node.data.id);
    }
  }

  // Update edges with new node IDs
  const deduplicatedEdges: GraphEdge[] = edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      source: idMapping.get(edge.data.source) || edge.data.source,
      target: idMapping.get(edge.data.target) || edge.data.target,
    }
  }));

  // Remove self-loops (edges where source === target after deduplication)
  const validEdges = deduplicatedEdges.filter(
    edge => edge.data.source !== edge.data.target
  );

  // Remove duplicate edges
  const uniqueEdges = removeDuplicateEdges(validEdges);

  return {
    elements: {
      nodes: deduplicatedNodes,
      edges: uniqueEdges,
    }
  };
}

/**
 * Remove duplicate edges (same source, target, and label)
 */
function removeDuplicateEdges(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();
  const uniqueEdges: GraphEdge[] = [];

  for (const edge of edges) {
    const key = `${edge.data.source}-${edge.data.target}-${edge.data.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueEdges.push(edge);
    }
  }

  return uniqueEdges;
}

/**
 * Validate that the graph is connected (no isolated nodes)
 * 
 * @param graphData - The graph data to validate
 * @returns true if all nodes are connected, false otherwise
 */
export function validateGraphConnectivity(graphData: GraphData): boolean {
  const { nodes, edges } = graphData.elements;
  
  if (!nodes || nodes.length === 0) {
    return true; // Empty graph is considered connected
  }

  if (nodes.length === 1) {
    return true; // Single node is considered connected
  }

  // Build adjacency list (undirected graph for connectivity check)
  const adjacency = new Map<string, Set<string>>();
  
  for (const node of nodes) {
    adjacency.set(node.data.id, new Set());
  }

  for (const edge of edges) {
    const sourceSet = adjacency.get(edge.data.source);
    const targetSet = adjacency.get(edge.data.target);
    
    if (sourceSet) sourceSet.add(edge.data.target);
    if (targetSet) targetSet.add(edge.data.source);
  }

  // BFS to check connectivity
  const visited = new Set<string>();
  const queue: string[] = [nodes[0].data.id];
  visited.add(nodes[0].data.id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacency.get(current) || new Set();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  // All nodes should be visited if graph is connected
  return visited.size === nodes.length;
}

/**
 * Find isolated nodes (nodes with no edges)
 */
export function findIsolatedNodes(graphData: GraphData): GraphNode[] {
  const { nodes, edges } = graphData.elements;
  
  const connectedNodeIds = new Set<string>();
  
  for (const edge of edges) {
    connectedNodeIds.add(edge.data.source);
    connectedNodeIds.add(edge.data.target);
  }

  return nodes.filter(node => !connectedNodeIds.has(node.data.id));
}

/**
 * Calculate quality metrics for the graph
 */
export interface GraphQualityMetrics {
  totalNodes: number;
  totalEdges: number;
  isolatedNodeCount: number;
  isolatedNodeRate: number;
  isConnected: boolean;
  averageEdgesPerNode: number;
  hasExplanations: boolean;
  explanationRate: number;
}

export function calculateQualityMetrics(graphData: GraphData): GraphQualityMetrics {
  const { nodes, edges } = graphData.elements;
  
  const isolatedNodes = findIsolatedNodes(graphData);
  const edgesWithExplanation = edges.filter(edge => 
    edge.data.explanation && edge.data.explanation.trim().length > 0
  );

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    isolatedNodeCount: isolatedNodes.length,
    isolatedNodeRate: nodes.length > 0 ? isolatedNodes.length / nodes.length : 0,
    isConnected: validateGraphConnectivity(graphData),
    averageEdgesPerNode: nodes.length > 0 ? edges.length / nodes.length : 0,
    hasExplanations: edgesWithExplanation.length === edges.length,
    explanationRate: edges.length > 0 ? edgesWithExplanation.length / edges.length : 0,
  };
}

/**
 * Merge two graphs together
 * Used when expanding existing graphs with new nodes
 */
export function mergeGraphs(
  existingGraph: GraphData,
  newGraph: GraphData
): GraphData {
  const existingNodeIds = new Set(
    existingGraph.elements.nodes.map(n => n.data.id)
  );

  // Only add truly new nodes
  const newNodes = newGraph.elements.nodes.filter(
    node => !existingNodeIds.has(node.data.id)
  );

  // Combine edges, removing duplicates
  const allEdges = [
    ...existingGraph.elements.edges,
    ...newGraph.elements.edges,
  ];

  const uniqueEdges = removeDuplicateEdges(allEdges);

  return {
    elements: {
      nodes: [...existingGraph.elements.nodes, ...newNodes],
      edges: uniqueEdges,
    }
  };
}

/**
 * Normalize node IDs to camelCase format
 */
export function normalizeNodeId(label: string): string {
  return label
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}
