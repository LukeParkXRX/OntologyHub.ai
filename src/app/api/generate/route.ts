import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

const SYSTEM_PROMPT = `
You are an expert Ontology Engineer and Knowledge Graph Architect. Your task is to deeply analyze the input text and construct a rich, interconnected Knowledge Graph.

### Objectives:
1. **Extract Entities (Nodes)**: Identify key concepts, objects, people, organizations, and abstract ideas.
2. **Infer Relationships (Edges)**: Determine how these entities are connected. Use precise, semantic relationship labels (e.g., "is_a", "part_of", "causes", "influenced_by", "has_role").
3. **Deep Reasoning & Expansion**:
    - **CRITICAL**: If the input text mentions a specific **Node ID** (e.g., "Expand on concept 'X' (ID: node_id)"), you **MUST** use that EXACT \`id\` as the source or target for connections to new nodes.
    - **NO ISOLATED NODES**: Every single node you return MUST be connected to the graph. If you create a new node "Y", you MUST create an edge linking it to the existing "node_id" (or another connected node).
    - **Infer implicit concepts** that are logically necessary to understand the context.
    - **Expand the ontology**: If a specific concept is mentioned, add its broader categories and specific instances.

### Output Format:
Return ONLY a JSON object strictly following this format (compatible with Cytoscape.js):
{
  "elements": {
    "nodes": [
      { "data": { "id": "unique_id_camelCase", "label": "Readable Label", "type": "Class | Instance | Concept" } }
    ],
    "edges": [
      { "data": { "source": "source_id", "target": "target_id", "label": "relationship_name", "explanation": "Brief explanation of why these two entities are connected (1-2 sentences)" } }
    ]
  }
}

### Constraints:
- IDs should be unique and preferably camelCase or snake_case.
- Do NOT include markdown formatting (like \`\`\`json). Just raw JSON.
- **Each edge MUST include an "explanation" field** that describes why the relationship exists.
- **Ensure the graph is connected**. If you add "Guardians of the Galaxy", you MUST create an edge linking it to "Marvel" (or the relevant parent node).
- **NO DISCONNECTED COMPONENTS**. The output must form a single connected graph component with the existing node.
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
        let graphData;
        try {
            graphData = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw content:", content);
            console.error("Cleaned content:", cleanedContent);
            return NextResponse.json(
                { error: "Failed to parse OpenAI response. The AI may have returned invalid JSON format." },
                { status: 500 }
            );
        }

        return NextResponse.json(graphData);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
