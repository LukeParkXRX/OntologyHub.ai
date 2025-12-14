"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, FolderOpen, Calendar, Database } from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { DomainWithStats } from "@/lib/domain-types";
import DomainCard from "@/components/DomainCard";
import CreateDomainDialog from "@/components/CreateDomainDialog";

export default function DomainsPage() {
    const [domains, setDomains] = useState<DomainWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            window.location.href = '/'; // Redirect to home if not authenticated
            return;
        }

        setUser(user);
        fetchDomains();
    };

    const fetchDomains = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/domains');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch domains');
            }

            setDomains(result.data || []);
        } catch (err: any) {
            console.error('Error fetching domains:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDomainCreated = () => {
        setShowCreateDialog(false);
        fetchDomains();
    };

    const handleDomainDeleted = () => {
        fetchDomains();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading domains...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl">
                <div className="container max-w-screen-2xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                ← Back to Home
                            </Link>
                            <h1 className="text-3xl font-bold mt-2">My Domains</h1>
                            <p className="text-muted-foreground mt-1">
                                Organize your knowledge graphs by domain
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateDialog(true)}
                            className="h-11 px-6 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 hover:scale-105 active:scale-95 text-white font-semibold transition-all flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            New Domain
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container max-w-screen-2xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                )}

                {domains.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <FolderOpen className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No domains yet</h2>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            Create your first domain to start organizing your knowledge graphs.
                            Domains help you categorize data by topic, industry, or project.
                        </p>
                        <button
                            onClick={() => setShowCreateDialog(true)}
                            className="h-11 px-6 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 hover:scale-105 active:scale-95 text-white font-semibold transition-all flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Create First Domain
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-6 rounded-xl bg-card/40 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FolderOpen className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Domains</p>
                                        <p className="text-2xl font-bold">{domains.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-xl bg-card/40 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                        <Database className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Data Entries</p>
                                        <p className="text-2xl font-bold">
                                            {domains.reduce((sum, d) => sum + (d.data_count || 0), 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-xl bg-card/40 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Updated</p>
                                        <p className="text-lg font-semibold">
                                            {domains.length > 0
                                                ? new Date(domains[0].updated_at).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Domains Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {domains.map((domain) => (
                                <DomainCard
                                    key={domain.id}
                                    domain={domain}
                                    onDeleted={handleDomainDeleted}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Create Domain Dialog */}
            {showCreateDialog && (
                <CreateDomainDialog
                    onClose={() => setShowCreateDialog(false)}
                    onCreated={handleDomainCreated}
                />
            )}
        </div>
    );
}
