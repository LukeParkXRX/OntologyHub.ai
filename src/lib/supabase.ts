import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export const supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder",
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Graph CRUD operations
export interface Graph {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    graph_data: {
        nodes: any[];
        edges: any[];
    };
    is_public: boolean;
    share_token?: string;
    created_at: string;
    updated_at: string;
}

export async function getUserGraphs(userId: string): Promise<Graph[]> {
    const { data, error } = await supabase
        .from("graphs")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getGraph(id: string, userId?: string): Promise<Graph | null> {
    let query = supabase.from("graphs").select("*").eq("id", id);

    if (userId) {
        query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) return null;
    return data;
}

export async function getGraphByShareToken(token: string): Promise<Graph | null> {
    const { data, error } = await supabase
        .from("graphs")
        .select("*")
        .eq("share_token", token)
        .eq("is_public", true)
        .single();

    if (error) return null;
    return data;
}

export async function createGraph(
    userId: string,
    title: string,
    graphData: { nodes: any[]; edges: any[] },
    description?: string
): Promise<Graph> {
    const { data, error } = await supabase
        .from("graphs")
        .insert({
            user_id: userId,
            title,
            description,
            graph_data: graphData,
            is_public: false,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateGraph(
    id: string,
    userId: string,
    updates: Partial<Pick<Graph, "title" | "description" | "graph_data">>
): Promise<Graph> {
    const { data, error } = await supabase
        .from("graphs")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteGraph(id: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from("graphs")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw error;
}

export async function generateShareToken(id: string, userId: string): Promise<string> {
    const shareToken = crypto.randomUUID();

    const { data, error } = await supabase
        .from("graphs")
        .update({ share_token: shareToken, is_public: true })
        .eq("id", id)
        .eq("user_id", userId)
        .select("share_token")
        .single();

    if (error) throw error;
    return data.share_token!;
}

export async function revokeShareToken(id: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from("graphs")
        .update({ share_token: null, is_public: false })
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw error;
}
