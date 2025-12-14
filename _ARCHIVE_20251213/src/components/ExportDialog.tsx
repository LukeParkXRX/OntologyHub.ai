"use client";

import { useState } from "react";
import { X, Download, Loader2, FileJson, FileSpreadsheet, FileCode } from "lucide-react";
import { ExportFormat, type Domain } from "@/lib/domain-types";

interface ExportDialogProps {
    domain: Domain;
    onClose: () => void;
}

export default function ExportDialog({ domain, onClose }: ExportDialogProps) {
    const [format, setFormat] = useState<ExportFormat>(ExportFormat.JSON);
    const [includeGraphs, setIncludeGraphs] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/domains/${domain.id}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format,
                    include_graphs: includeGraphs,
                }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to export data');
            }

            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${domain.name.replace(/[^a-z0-9]/gi, '_')}_export.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            onClose();
        } catch (err: any) {
            console.error('Error exporting data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatOptions = [
        {
            value: ExportFormat.JSON,
            label: 'JSON',
            description: 'Standard JSON format, compatible with most tools',
            icon: FileJson,
        },
        {
            value: ExportFormat.CSV,
            label: 'CSV',
            description: 'Comma-separated values for spreadsheet applications',
            icon: FileSpreadsheet,
        },
        {
            value: ExportFormat.GRAPHML,
            label: 'GraphML',
            description: 'XML-based graph format for Gephi, yEd, Cytoscape',
            icon: FileCode,
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-card border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Download className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Export Data</h2>
                            <p className="text-sm text-muted-foreground">Download {domain.name}</p>
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

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Export Format
                        </label>
                        <div className="space-y-2">
                            {formatOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setFormat(option.value)}
                                        className={`w-full p-4 rounded-lg border transition-all text-left ${format === option.value
                                                ? 'border-primary bg-primary/10'
                                                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                        disabled={loading}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className={`h-5 w-5 mt-0.5 ${format === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <div className="flex-1">
                                                <div className="font-medium">{option.label}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {option.description}
                                                </div>
                                            </div>
                                            {format === option.value && (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background border border-white/10">
                        <input
                            type="checkbox"
                            id="includeGraphs"
                            checked={includeGraphs}
                            onChange={(e) => setIncludeGraphs(e.target.checked)}
                            className="mt-1"
                            disabled={loading}
                        />
                        <label htmlFor="includeGraphs" className="flex-1 cursor-pointer">
                            <div className="font-medium text-sm">Include Knowledge Graphs</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Export generated graph data along with text content
                            </div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 h-11 px-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className="flex-1 h-11 px-4 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 hover:scale-105 active:scale-95 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Export
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
