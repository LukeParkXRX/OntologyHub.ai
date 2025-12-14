"use client";

import { useState } from "react";
import { X, Loader2, Sparkles, FileText } from "lucide-react";

interface DataCollectionFormProps {
    domainId: string;
    onClose: () => void;
    onAdded: () => void;
}

export default function DataCollectionForm({ domainId, onClose, onAdded }: DataCollectionFormProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [generateGraph, setGenerateGraph] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let graphData = null;

            // Generate graph if requested
            if (generateGraph) {
                const graphResponse = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: content }),
                });

                if (graphResponse.ok) {
                    graphData = await graphResponse.json();
                }
            }

            // Save data entry
            const response = await fetch(`/api/domains/${domainId}/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    graph_data: graphData,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to add data');
            }

            onAdded();
        } catch (err: any) {
            console.error('Error adding data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-card border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-card z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Add Data Entry</h2>
                            <p className="text-sm text-muted-foreground">Collect knowledge for this domain</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Introduction to Machine Learning"
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Content <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter your knowledge text here... The system will extract entities and relationships to build a knowledge graph."
                            rows={10}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            required
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            {content.length} characters
                        </p>
                    </div>

                    {/* Generate Graph Option */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <input
                            type="checkbox"
                            id="generateGraph"
                            checked={generateGraph}
                            onChange={(e) => setGenerateGraph(e.target.checked)}
                            className="mt-1"
                            disabled={loading}
                        />
                        <label htmlFor="generateGraph" className="flex-1 cursor-pointer">
                            <div className="font-medium text-sm">Auto-generate Knowledge Graph</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Automatically extract entities and relationships from the content using AI
                            </div>
                        </label>
                        <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 px-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim() || !content.trim()}
                            className="flex-1 h-11 px-4 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 hover:scale-105 active:scale-95 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {generateGraph ? 'Generating Graph...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Add Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
