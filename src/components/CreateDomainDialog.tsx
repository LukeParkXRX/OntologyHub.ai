"use client";

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import type { CreateDomainInput } from "@/lib/domain-types";

interface CreateDomainDialogProps {
    onClose: () => void;
    onCreated: () => void;
}

const CATEGORIES = [
    'Healthcare',
    'Finance',
    'Education',
    'Technology',
    'Science',
    'Business',
    'Legal',
    'Marketing',
    'Other',
];

export default function CreateDomainDialog({ onClose, onCreated }: CreateDomainDialogProps) {
    const [formData, setFormData] = useState<CreateDomainInput>({
        name: '',
        description: '',
        category: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create domain');
            }

            onCreated();
        } catch (err: any) {
            console.error('Error creating domain:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Create New Domain</h2>
                            <p className="text-sm text-muted-foreground">Organize your knowledge by topic</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
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

                    {/* Domain Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Domain Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Healthcare Research"
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            disabled={loading}
                        >
                            <option value="">Select a category...</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this domain..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            disabled={loading}
                        />
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
                            disabled={loading || !formData.name.trim()}
                            className="flex-1 h-11 px-4 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 hover:scale-105 active:scale-95 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Create Domain
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
