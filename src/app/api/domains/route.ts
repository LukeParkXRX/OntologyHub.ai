// API Route: /api/domains
// Handles domain CRUD operations

import { NextResponse } from 'next/server';
import { getSupabaseClient, getCurrentUser } from '@/lib/supabase-client';
import type { CreateDomainInput, UpdateDomainInput } from '@/lib/domain-types';

/**
 * GET /api/domains
 * List all domains for the authenticated user
 */
export async function GET(request: Request) {
    try {
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Fetch domains with data count
        const { data: domains, error } = await supabase
            .from('domains')
            .select(`
        *,
        domain_data (count)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[GET /api/domains] Error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch domains' },
                { status: 500 }
            );
        }

        // Transform data to include counts
        const domainsWithStats = domains.map(domain => ({
            ...domain,
            data_count: domain.domain_data?.[0]?.count || 0,
            graph_count: 0, // Will be calculated from domain_data with graph_data
        }));

        return NextResponse.json({ data: domainsWithStats });
    } catch (error: any) {
        console.error('[GET /api/domains] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/domains
 * Create a new domain
 */
export async function POST(request: Request) {
    try {
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body: CreateDomainInput = await request.json();
        const { name, description, category, settings } = body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Domain name is required' },
                { status: 400 }
            );
        }

        // Check subscription limits
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('features')
            .eq('user_id', user.id)
            .single();

        const { data: existingDomains } = await supabase
            .from('domains')
            .select('id')
            .eq('user_id', user.id);

        const maxDomains = subscription?.features?.max_domains || 3;
        if (existingDomains && existingDomains.length >= maxDomains) {
            return NextResponse.json(
                { error: `Domain limit reached. Maximum ${maxDomains} domains allowed for your plan.` },
                { status: 403 }
            );
        }

        // Create domain
        const { data: domain, error } = await supabase
            .from('domains')
            .insert({
                user_id: user.id,
                name: name.trim(),
                description: description?.trim() || null,
                category: category?.trim() || null,
                settings: settings || {},
            })
            .select()
            .single();

        if (error) {
            console.error('[POST /api/domains] Error:', error);
            return NextResponse.json(
                { error: 'Failed to create domain' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: domain }, { status: 201 });
    } catch (error: any) {
        console.error('[POST /api/domains] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/domains
 * Update an existing domain
 */
export async function PUT(request: Request) {
    try {
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, ...updates }: { id: string } & UpdateDomainInput = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Domain ID is required' },
                { status: 400 }
            );
        }

        // Update domain (RLS will ensure user owns it)
        const { data: domain, error } = await supabase
            .from('domains')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('[PUT /api/domains] Error:', error);
            return NextResponse.json(
                { error: 'Failed to update domain' },
                { status: 500 }
            );
        }

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: domain });
    } catch (error: any) {
        console.error('[PUT /api/domains] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/domains
 * Delete a domain
 */
export async function DELETE(request: Request) {
    try {
        const supabase = getSupabaseClient();
        const user = await getCurrentUser(supabase);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Domain ID is required' },
                { status: 400 }
            );
        }

        // Delete domain (RLS will ensure user owns it, CASCADE will delete domain_data)
        const { error } = await supabase
            .from('domains')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('[DELETE /api/domains] Error:', error);
            return NextResponse.json(
                { error: 'Failed to delete domain' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Domain deleted successfully' });
    } catch (error: any) {
        console.error('[DELETE /api/domains] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
