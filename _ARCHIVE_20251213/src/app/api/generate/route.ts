import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAllRelationshipTypes } from "@/lib/ontology-types";
import { formatFewShotExamples } from "@/lib/prompt-examples";
import { 
    deduplicateNodes, 
    validateGraphConnectivity, 
    calculateQualityMetrics,
    type GraphData 
} from "@/lib/graph-utils";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// Build the relationship types section for the prompt
const RELATIONSHIP_TYPES_LIST = getAllRelationshipTypes()
    .map(type => `  - "${type}"`)
    .join('\n');

const SYSTEM_PROMPT = `
You are an expert Ontology Engineer and Knowledge Graph Architect. Your task is to deeply analyze the input text and construct a rich, interconnected Knowledge Graph using standardized relationship types and best practices.

## Standard Relationship Types

To ensure consistency and quality, you **MUST** use ONLY the following predefined relationship types:

${RELATIONSHIP_TYPES_LIST}

**CRITICAL**: Do NOT invent new relationship types. Choose the most appropriate type from the list above.

## Few-Shot Examples

Here are examples of high-quality knowledge graphs across different domains:

${formatFewShotExamples(3)}

## Task Instructions

### 1. Extract Entities (Nodes)
- Identify key concepts, objects, people, organizations, and abstract ideas
- Use clear, concise labels (e.g., "Photosynthesis", "Marketing Department")
- Assign appropriate types: "Class", "Instance", "Concept", or "Process"

### 2. Infer Relationships (Edges)
- Determine how entities are connected using the standard relationship types above
- **MUST** include an "explanation" field for each edge (1-2 sentences)
- Choose the most semantically precise relationship type

### 3. Deep Reasoning & Expansion
- **CRITICAL**: If the input mentions a specific **Node ID** (e.g., "Expand on concept 'X' (ID: node_id)"), you **MUST** use that EXACT \`id\` as the source or target for connections to new nodes
- **NO ISOLATED NODES**: Every single node you return MUST be connected to the graph
- If you create a new node "Y", you MUST create an edge linking it to the existing "node_id" (or another connected node)
- Infer implicit concepts that are logically necessary to understand the context
- Expand the ontology: If a specific concept is mentioned, add its broader categories and specific instances

### 4. Node ID Generation Rules
- Use camelCase format (e.g., "machineLearning", "marketingDepartment")
- Be consistent: "dog" and "dogs" should use the same ID (e.g., "dog")
- Avoid special characters except underscores
- Keep IDs concise but descriptive

## Output Format

Return ONLY a JSON object strictly following this format (compatible with Cytoscape.js):

{
  "elements": {
    "nodes": [
      { 
        "data": { 
          "id": "uniqueIdCamelCase", 
          "label": "Readable Label", 
          "type": "Class | Instance | Concept | Process" 
        } 
      }
    ],
    "edges": [
      { 
        "data": { 
          "source": "sourceNodeId", 
          "target": "targetNodeId", 
          "label": "relationship_type_from_standard_list", 
          "explanation": "Brief explanation of why these two entities are connected (1-2 sentences)" 
        } 
      }
    ]
  }
}

## Quality Constraints

**MUST (Required)**:
- Use ONLY standard relationship types from the provided list
- Include "explanation" field for every edge
- Ensure all nodes are connected (no isolated components)
- Use camelCase for node IDs
- Return valid JSON without markdown formatting

**SHOULD (Strongly Recommended)**:
- Create 3-7 nodes for initial graphs
- Add 2-5 new nodes when expanding existing graphs
- Use semantically precise relationship types
- Maintain consistent node ID naming

**MUST NOT (Forbidden)**:
- Do NOT create isolated nodes
- Do NOT invent new relationship types
- Do NOT include markdown code blocks (\`\`\`json)
- Do NOT create duplicate nodes with different IDs for the same concept
- Do NOT create self-referential edges (source === target)

## Example Validation

Before returning your output, verify:
1. ✅ All relationship labels are from the standard list
2. ✅ Every edge has an explanation
3. ✅ All nodes are connected (run mental BFS check)
4. ✅ Node IDs are in camelCase
5. ✅ No duplicate concepts with different IDs
6. ✅ Valid JSON format (no markdown)
`;

export async function POST(request: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Invalid input: 'text' is required" },
                { status: 400 }
            );
        }

        console.log('[API /generate] Processing request:', { textLength: text.length });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: text },
            ],
            temperature: 0.1,
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error("No content received from OpenAI");
        }

        // Clean the content - remove markdown code blocks if present
        let cleanedContent = content.trim();

        // Remove ```json and ``` if present
        if (cleanedContent.startsWith("```")) {
            cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        // Attempt to parse JSON to ensure validity before sending back
        let graphData: GraphData;
        try {
            graphData = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("[API /generate] JSON Parse Error:", parseError);
            console.error("[API /generate] Raw content:", content);
            console.error("[API /generate] Cleaned content:", cleanedContent);
            return NextResponse.json(
                { error: "Failed to parse OpenAI response. The AI may have returned invalid JSON format." },
                { status: 500 }
            );
        }

        // Post-processing: Deduplicate nodes
        console.log('[API /generate] Before deduplication:', {
            nodes: graphData.elements.nodes.length,
            edges: graphData.elements.edges.length
        });

        graphData = deduplicateNodes(graphData, 0.85);

        console.log('[API /generate] After deduplication:', {
            nodes: graphData.elements.nodes.length,
            edges: graphData.elements.edges.length
        });

        // Validate connectivity
        const isConnected = validateGraphConnectivity(graphData);
        if (!isConnected) {
            console.warn('[API /generate] Warning: Graph contains isolated nodes');
        }

        // Calculate and log quality metrics
        const metrics = calculateQualityMetrics(graphData);
        console.log('[API /generate] Quality Metrics:', {
            totalNodes: metrics.totalNodes,
            totalEdges: metrics.totalEdges,
            isolatedNodeCount: metrics.isolatedNodeCount,
            isolatedNodeRate: `${(metrics.isolatedNodeRate * 100).toFixed(1)}%`,
            isConnected: metrics.isConnected,
            averageEdgesPerNode: metrics.averageEdgesPerNode.toFixed(2),
            explanationRate: `${(metrics.explanationRate * 100).toFixed(1)}%`
        });

        return NextResponse.json(graphData);
    } catch (error: any) {
        console.error("[API /generate] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
