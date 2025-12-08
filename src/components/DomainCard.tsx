"use client";

import { useState } from "react";
import { Trash2, ExternalLink, Download, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { DomainWithStats } from "@/lib/domain-types";

interface DomainCardProps {
    domain: DomainWithStats;
    onDeleted: () => void;
}

export default function DomainCard({ domain, onDeleted }: DomainCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${domain.name}"? This will delete all associated data.`)) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`/api/domains?id=${domain.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete domain');
            }

            onDeleted();
        } catch (error: any) {
            console.error('Error deleting domain:', error);
            alert(error.message);
        } finally {
            setDeleting(false);
            setShowMenu(false);
        }
    };

    const getCategoryColor = (category?: string) => {
        if (!category) return 'bg-gray-500/10 text-gray-400';

        const colors: Record<string, string> = {
            'Healthcare': 'bg-green-500/10 text-green-400',
            'Finance': 'bg-blue-500/10 text-blue-400',
            'Education': 'bg-purple-500/10 text-purple-400',
            'Technology': 'bg-cyan-500/10 text-cyan-400',
            'Science': 'bg-pink-500/10 text-pink-400',
        };

        return colors[category] || 'bg-primary/10 text-primary';
    };

    return (
        <div className="group relative p-6 rounded-xl bg-card/40 border border-white/10 hover:border-primary/30 hover:bg-card/60 transition-all">
            {/* Category Badge */}
            {domain.category && (
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(domain.category)}`}>
                    {domain.category}
                </div>
            )}

            {/* Domain Name */}
            <Link href={`/domains/${domain.id}`}>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                    {domain.name}
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
            </Link>

            {/* Description */}
            {domain.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {domain.description}
                </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{domain.data_count || 0}</span>
                    <span>entries</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{domain.graph_count || 0}</span>
                    <span>graphs</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-muted-foreground">
                    Updated {new Date(domain.updated_at).toLocaleDateString()}
                </span>

                {/* Actions Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-card border border-white/10 shadow-xl z-20 overflow-hidden">
                                <Link
                                    href={`/domains/${domain.id}`}
                                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Open Domain
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-500/10 text-red-400 transition-colors text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {deleting ? 'Deleting...' : 'Delete Domain'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
