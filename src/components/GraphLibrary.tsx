"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Trash2, Share2, Eye, X } from "lucide-react";

interface Graph {
    id: string;
    title: string;
    description?: string;
    graph_data: { nodes: any[]; edges: any[] };
    created_at: string;
    updated_at: string;
    is_public: boolean;
    share_token?: string;
}

interface GraphLibraryProps {
    onLoad: (graphData: { nodes: any[]; edges: any[] }) => void;
    onClose: () => void;
}

export default function GraphLibrary({ onLoad, onClose }: GraphLibraryProps) {
    const { data: session } = useSession();
    const [graphs, setGraphs] = useState<Graph[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shareLoading, setShareLoading] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            fetchGraphs();
        }
    }, [session]);

    const fetchGraphs = async () => {
        try {
            const response = await fetch("/api/graphs");
            if (!response.ok) throw new Error("Failed to fetch graphs");

            const data = await response.json();
            setGraphs(data.graphs || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load graphs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this graph?")) return;

        try {
            const response = await fetch(`/api/graphs/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete graph");

            setGraphs(graphs.filter((g) => g.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete graph");
        }
    };

    const handleShare = async (id: string) => {
        setShareLoading(id);
        try {
            const response = await fetch(`/api/graphs/${id}/share`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Failed to generate share link");

            const data = await response.json();

            // Copy to clipboard
            await navigator.clipboard.writeText(data.shareUrl);
            alert("Share link copied to clipboard!");

            // Refresh graphs to show share token
            fetchGraphs();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to generate share link");
        } finally {
            setShareLoading(null);
        }
    };

    const handleLoad = (graph: Graph) => {
        onLoad(graph.graph_data);
        onClose();
    };

    if (!session) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-card border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                        <p className="text-muted-foreground mb-4">
                            Please sign in to view your saved graphs
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-white/10 rounded-2xl max-w-4xl w-full max-h-[80vh] shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-semibold">My Graphs</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : graphs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No saved graphs yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Create a graph and save it to see it here
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {graphs.map((graph) => (
                                <div
                                    key={graph.id}
                                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">{graph.title}</h4>
                                            {graph.description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {graph.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>
                                                    {graph.graph_data.nodes.length} nodes, {graph.graph_data.edges.length} edges
                                                </span>
                                                <span>
                                                    {new Date(graph.created_at).toLocaleDateString()}
                                                </span>
                                                {graph.is_public && (
                                                    <span className="text-primary">🔗 Shared</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleLoad(graph)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Load graph"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleShare(graph.id)}
                                                disabled={shareLoading === graph.id}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                                title="Share graph"
                                            >
                                                {shareLoading === graph.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Share2 className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(graph.id)}
                                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                title="Delete graph"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
