import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserGraphs, createGraph } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET /api/graphs - Get all graphs for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const graphs = await getUserGraphs(session.user.id);
        return NextResponse.json({ graphs });
    } catch (error) {
        console.error("[GET /api/graphs] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch graphs" },
            { status: 500 }
        );
    }
}

// POST /api/graphs - Create a new graph
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, graphData } = body;

        if (!title || !graphData) {
            return NextResponse.json(
                { error: "Title and graph data are required" },
                { status: 400 }
            );
        }

        const graph = await createGraph(
            session.user.id,
            title,
            graphData,
            description
        );

        return NextResponse.json({ graph }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/graphs] Error:", error);
        return NextResponse.json(
            { error: "Failed to create graph" },
            { status: 500 }
        );
    }
}
