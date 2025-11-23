"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { X, Save, Loader2 } from "lucide-react";

interface SaveGraphDialogProps {
    graphData: { nodes: any[]; edges: any[] };
    onClose: () => void;
    onSave?: () => void;
}

export default function SaveGraphDialog({
    graphData,
    onClose,
    onSave,
}: SaveGraphDialogProps) {
    const { data: session } = useSession();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/graphs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    graphData,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save graph");
            }

            onSave?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save graph");
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-card border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                        <p className="text-muted-foreground mb-4">
                            Please sign in to save your graph
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Save Graph</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My Knowledge Graph"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description for your graph..."
                            rows={3}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                        {graphData.nodes.length} nodes, {graphData.edges.length} edges
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !title.trim()}
                        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Graph
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
