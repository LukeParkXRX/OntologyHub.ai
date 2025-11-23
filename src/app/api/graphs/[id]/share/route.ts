import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateShareToken, revokeShareToken } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// POST /api/graphs/[id]/share - Generate share link
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const shareToken = await generateShareToken(id, session.user.id);

        return NextResponse.json({
            shareToken,
            shareUrl: `${process.env.NEXTAUTH_URL}/share/${shareToken}`,
        });
    } catch (error) {
        console.error(`[POST /api/graphs/share/error] Error:`, error);
        return NextResponse.json(
            { error: "Failed to generate share link" },
            { status: 500 }
        );
    }
}

// DELETE /api/graphs/[id]/share - Revoke share link
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

        await revokeShareToken(id, session.user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[DELETE /api/graphs/share/error] Error:`, error);
        return NextResponse.json(
            { error: "Failed to revoke share link" },
            { status: 500 }
        );
    }
}
