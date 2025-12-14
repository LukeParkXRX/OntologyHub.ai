// Supabase client utilities for server and client-side usage

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client (for use in React components)
export function getSupabaseClient() {
    return createClientComponentClient();
}

// Server-side Supabase client (for use in API routes)
export function getServerSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
}

// Helper to get current user from Supabase
export async function getCurrentUser(client: ReturnType<typeof getSupabaseClient>) {
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

// Helper to check if user is authenticated
export async function requireAuth(client: ReturnType<typeof getSupabaseClient>) {
    const user = await getCurrentUser(client);

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}
