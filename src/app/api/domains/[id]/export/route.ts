// API Route: /api/domains/[id]/export
// Handles data export for a specific domain

import { NextResponse } from 'next/server';
import { getSupabaseClient, getCurrentUser } from '@/lib/supabase-client';
import { exportToJSON, exportToCSV, exportToGraphML } from '@/lib/export-utils';
import { ExportFormat, type ExportOptions, type GraphData } from '@/lib/domain-types';

/**
 * POST /api/domains/[id]/export
 * Export domain data in specified format
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const domainId = params.id;
        const body: ExportOptions = await request.json();
        const { format, include_graphs = true, data_ids } = body;

        if (!format || !Object.values(ExportFormat).includes(format)) {
            return NextResponse.json(
                { error: 'Valid export format is required (json, csv, graphml)' },
                { status: 400 }
            );
        }

        // Verify domain ownership and get domain info
        const { data: domain, error: domainError } = await supabase
            .from('domains')
            .select('*')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single();

        if (domainError || !domain) {
            return NextResponse.json(
                { error: 'Domain not found' },
                { status: 404 }
            );
        }

        // Check subscription features
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('features')
            .eq('user_id', user.id)
            .single();

        const allowedFormats = subscription?.features?.export_formats || ['json'];
        if (!allowedFormats.includes(format)) {
            return NextResponse.json(
                { error: `Export format '${format}' not available in your plan` },
                { status: 403 }
            );
        }

        // Fetch domain data
        let query = supabase
            .from('domain_data')
            .select('*')
            .eq('domain_id', domainId);

        if (data_ids && data_ids.length > 0) {
            query = query.in('id', data_ids);
        }

        const { data: domainData, error: dataError } = await query;

        if (dataError) {
            console.error('[POST /api/domains/[id]/export] Error:', dataError);
            return NextResponse.json(
                { error: 'Failed to fetch domain data' },
                { status: 500 }
            );
        }

        if (!domainData || domainData.length === 0) {
            return NextResponse.json(
                { error: 'No data to export' },
                { status: 404 }
            );
        }

        // Prepare export data
        let exportContent: string;
        let contentType: string;
        let fileExtension: string;

        if (format === ExportFormat.JSON) {
            const exportData = {
                domain: {
                    id: domain.id,
                    name: domain.name,
                    description: domain.description,
                    category: domain.category,
                },
                data: domainData.map(item => ({
                    id: item.id,
                    title: item.title,
                    content: item.content,
                    metadata: item.metadata,
                    ...(include_graphs && item.graph_data ? { graph_data: item.graph_data } : {}),
                    created_at: item.created_at,
                })),
                exported_at: new Date().toISOString(),
            };
            exportContent = exportToJSON(exportData);
            contentType = 'application/json';
            fileExtension = 'json';
        } else if (format === ExportFormat.CSV) {
            // For CSV, we'll export a combined graph from all data entries
            const allNodes: any[] = [];
            const allEdges: any[] = [];
            const nodeIds = new Set<string>();

            domainData.forEach(item => {
                if (item.graph_data && include_graphs) {
                    item.graph_data.elements.nodes.forEach((node: any) => {
                        if (!nodeIds.has(node.data.id)) {
                            allNodes.push(node);
                            nodeIds.add(node.data.id);
                        }
                    });
                    item.graph_data.elements.edges.forEach((edge: any) => {
                        allEdges.push(edge);
                    });
                }
            });

            const combinedGraph: GraphData = {
                elements: {
                    nodes: allNodes,
                    edges: allEdges,
                },
            };

            exportContent = exportToCSV(combinedGraph);
            contentType = 'text/csv';
            fileExtension = 'csv';
        } else if (format === ExportFormat.GRAPHML) {
            // For GraphML, combine all graphs
            const allNodes: any[] = [];
            const allEdges: any[] = [];
            const nodeIds = new Set<string>();

            domainData.forEach(item => {
                if (item.graph_data && include_graphs) {
                    item.graph_data.elements.nodes.forEach((node: any) => {
                        if (!nodeIds.has(node.data.id)) {
                            allNodes.push(node);
                            nodeIds.add(node.data.id);
                        }
                    });
                    item.graph_data.elements.edges.forEach((edge: any) => {
                        allEdges.push(edge);
                    });
                }
            });

            const combinedGraph: GraphData = {
                elements: {
                    nodes: allNodes,
                    edges: allEdges,
                },
            };

            exportContent = exportToGraphML(combinedGraph);
            contentType = 'application/xml';
            fileExtension = 'graphml';
        } else {
            return NextResponse.json(
                { error: 'Unsupported export format' },
                { status: 400 }
            );
        }

        // Check file size limit
        const fileSizeBytes = new Blob([exportContent]).size;
        const maxSizeMB = subscription?.features?.max_export_size_mb || 10;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (fileSizeBytes > maxSizeBytes) {
            return NextResponse.json(
                { error: `Export size exceeds limit of ${maxSizeMB}MB` },
                { status: 413 }
            );
        }

        // Log export to history
        await supabase.from('export_history').insert({
            user_id: user.id,
            domain_id: domainId,
            format,
            file_size_bytes: fileSizeBytes,
            status: 'success',
        });

        // Return file content
        return new NextResponse(exportContent, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${domain.name.replace(/[^a-z0-9]/gi, '_')}_export.${fileExtension}"`,
                'Content-Length': fileSizeBytes.toString(),
            },
        });
    } catch (error: any) {
        console.error('[POST /api/domains/[id]/export] Error:', error);

        // Log failed export
        try {
            const supabase = getSupabaseClient();
            const user = await getCurrentUser(supabase);
            if (user) {
                await supabase.from('export_history').insert({
                    user_id: user.id,
                    domain_id: params.id,
                    format: ExportFormat.JSON,
                    status: 'failed',
                });
            }
        } catch (logError) {
            console.error('[POST /api/domains/[id]/export] Failed to log error:', logError);
        }

        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
