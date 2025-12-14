import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGraph, updateGraph, deleteGraph } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET /api/graphs/[id] - Get a specific graph
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const graph = await getGraph(id, session.user.id);

        if (!graph) {
            return NextResponse.json({ error: "Graph not found" }, { status: 404 });
        }

        return NextResponse.json({ graph });
    } catch (error) {
        console.error(`[GET /api/graphs/error] Error:`, error);
        return NextResponse.json(
            { error: "Failed to fetch graph" },
            { status: 500 }
        );
    }
}

// PUT /api/graphs/[id] - Update a graph
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, graphData } = body;

        const graph = await updateGraph(id, session.user.id, {
            title,
            description,
            graph_data: graphData,
        });

        return NextResponse.json({ graph });
    } catch (error) {
        console.error(`[PUT /api/graphs/error] Error:`, error);
        return NextResponse.json(
            { error: "Failed to update graph" },
            { status: 500 }
        );
    }
}

// DELETE /api/graphs/[id] - Delete a graph
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await deleteGraph(id, session.user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[DELETE /api/graphs/error] Error:`, error);
        return NextResponse.json(
            { error: "Failed to delete graph" },
            { status: 500 }
        );
    }
}
