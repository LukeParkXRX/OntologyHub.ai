// API Route: /api/domains/[id]/data
// Handles data collection for a specific domain

import { NextResponse } from 'next/server';
import { getSupabaseClient, getCurrentUser } from '@/lib/supabase-client';
import type { CreateDomainDataInput } from '@/lib/domain-types';

/**
 * GET /api/domains/[id]/data
 * List all data entries for a specific domain
 */
// GET /api/domains/[id]/data
// List all data entries for a specific domain

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const domainId = params.id;

        // Verify domain ownership
        const { data: domain } = await supabase
            .from('domains')
            .select('id')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single();

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain not found' },
                { status: 404 }
            );
        }

        // Fetch domain data
        const { data: domainData, error } = await supabase
            .from('domain_data')
            .select('*')
            .eq('domain_id', domainId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[GET /api/domains/[id]/data] Error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch domain data' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: domainData });
    } catch (error: any) {
        console.error('[GET /api/domains/[id]/data] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/domains/[id]/data
 * Add new data entry to a domain
 */
// POST /api/domains/[id]/data
// Add new data entry to a domain

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const domainId = params.id;
        const body: CreateDomainDataInput = await request.json();
        const { title, content, metadata, graph_data } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Verify domain ownership
        const { data: domain } = await supabase
            .from('domains')
            .select('id')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single();

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain not found' },
                { status: 404 }
            );
        }

        // Check subscription limits
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('features')
            .eq('user_id', user.id)
            .single();

        const { data: existingData } = await supabase
            .from('domain_data')
            .select('id')
            .eq('domain_id', domainId);

        const maxDataPerDomain = subscription?.features?.max_data_per_domain || 50;
        if (existingData && existingData.length >= maxDataPerDomain) {
            return NextResponse.json(
                { error: `Data limit reached. Maximum ${maxDataPerDomain} entries allowed per domain.` },
                { status: 403 }
            );
        }

        // Create data entry
        const { data: newData, error } = await supabase
            .from('domain_data')
            .insert({
                domain_id: domainId,
                user_id: user.id,
                title: title.trim(),
                content: content.trim(),
                metadata: metadata || {},
                graph_data: graph_data || null,
            })
            .select()
            .single();

        if (error) {
            console.error('[POST /api/domains/[id]/data] Error:', error);
            return NextResponse.json(
                { error: 'Failed to create data entry' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: newData }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/domains/[id]/data] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/domains/[id]/data
 * Delete a data entry from a domain
 */
// DELETE /api/domains/[id]/data
// Delete a data entry from a domain

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const dataId = searchParams.get('dataId');

        if (!dataId) {
            return NextResponse.json(
                { error: 'Data ID is required' },
                { status: 400 }
            );
        }

        // Delete data entry (RLS will ensure user owns it)
        const { error } = await supabase
            .from('domain_data')
            .delete()
            .eq('id', dataId)
            .eq('user_id', user.id);

        if (error) {
            console.error('[DELETE /api/domains/[id]/data] Error:', error);
            return NextResponse.json(
                { error: 'Failed to delete data entry' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Data entry deleted successfully' });
    } catch (error: any) {
        console.error('[DELETE /api/domains/[id]/data] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
