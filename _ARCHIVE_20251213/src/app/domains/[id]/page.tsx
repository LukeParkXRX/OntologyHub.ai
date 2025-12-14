"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Loader2, Download, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Domain, DomainData } from "@/lib/domain-types";
import DataCollectionForm from "@/components/DataCollectionForm";
import ExportDialog from "@/components/ExportDialog";
import dynamic from "next/dynamic";

const GraphView = dynamic(() => import("@/components/GraphView"), {
    ssr: false,
});

export default function DomainDetailPage() {
    const params = useParams();
    const domainId = params.id as string;

    const [domain, setDomain] = useState<Domain | null>(null);
    const [domainData, setDomainData] = useState<DomainData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDataForm, setShowDataForm] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [selectedData, setSelectedData] = useState<DomainData | null>(null);

    useEffect(() => {
        if (domainId) {
            fetchDomain();
            fetchDomainData();
        }
    }, [domainId]);

    const fetchDomain = async () => {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from('domains')
                .select('*')
                .eq('id', domainId)
                .single();

            if (error) throw error;
            setDomain(data);
        } catch (err: any) {
            console.error('Error fetching domain:', err);
            setError(err.message);
        }
    };

    const fetchDomainData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/domains/${domainId}/data`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            setDomainData(result.data || []);
        } catch (err: any) {
            console.error('Error fetching domain data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDataAdded = () => {
        setShowDataForm(false);
        fetchDomainData();
    };

    const handleDeleteData = async (dataId: string) => {
        if (!confirm('Are you sure you want to delete this data entry?')) {
            return;
        }

        try {
            const response = await fetch(`/api/domains/${domainId}/data?dataId=${dataId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete data');
            }

            fetchDomainData();
        } catch (err: any) {
            console.error('Error deleting data:', err);
            alert(err.message);
        }
    };

    if (loading && !domain) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !domain) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link href="/domains" className="text-primary hover:underline">
                        ← Back to Domains
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl">
                <div className="container max-w-screen-2xl mx-auto px-6 py-4">
                    <Link href="/domains" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 mb-3">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Domains
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{domain?.name}</h1>
                            {domain?.description && (
                                <p className="text-muted-foreground mt-1">{domain.description}</p>
                            )}
                            {domain?.category && (
                                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    {domain.category}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowExportDialog(true)}
                                disabled={domainData.length === 0}
                                className="h-10 px-4 rounded-lg bg-card border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="h-4 w-4" />
                                Export Data
                            </button>
                            <button
                                onClick={() => setShowDataForm(true)}
                                className="h-10 px-4 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 text-white font-semibold transition-all flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Data
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container max-w-screen-2xl mx-auto px-6 py-8">
                {domainData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No data yet</h2>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            Start collecting data for this domain. Add text entries and generate knowledge graphs.
                        </p>
                        <button
                            onClick={() => setShowDataForm(true)}
                            className="h-11 px-6 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 text-white font-semibold transition-all flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Add First Entry
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {domainData.map((data) => (
                            <div
                                key={data.id}
                                className="p-6 rounded-xl bg-card/40 border border-white/10 hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-2">{data.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {data.content}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteData(data.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {data.graph_data && (
                                    <div className="mt-4">
                                        <div className="h-[300px] rounded-lg border border-white/10 bg-[#020617] overflow-hidden">
                                            <GraphView
                                                elements={data.graph_data.elements}
                                                onNodeClick={() => { }}
                                                onEdgeClick={() => { }}
                                                isFullscreen={false}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Created {new Date(data.created_at).toLocaleString()}</span>
                                    {data.graph_data && (
                                        <span>
                                            {data.graph_data.elements.nodes.length} nodes, {data.graph_data.elements.edges.length} edges
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Dialogs */}
            {showDataForm && (
                <DataCollectionForm
                    domainId={domainId}
                    onClose={() => setShowDataForm(false)}
                    onAdded={handleDataAdded}
                />
            )}

            {showExportDialog && domain && (
                <ExportDialog
                    domain={domain}
                    onClose={() => setShowExportDialog(false)}
                />
            )}
        </div>
    );
}
