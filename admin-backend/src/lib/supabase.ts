import 'dotenv/config'; // This loads .env before anything else

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Check if credentials are configured
const isConfigured = Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));

if (!isConfigured) {
    console.warn('⚠️  Supabase credentials not configured. Database operations will fail.');
    console.warn('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
}

// Create a mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
    const mockResponse = { data: null, error: { message: 'Supabase not configured' }, count: 0 };
    const mockQuery: any = {
        select: () => mockQuery,
        insert: () => mockQuery,
        update: () => mockQuery,
        delete: () => mockQuery,
        eq: () => mockQuery,
        or: () => mockQuery,
        single: () => Promise.resolve(mockResponse),
        range: () => mockQuery,
        order: () => mockQuery,
        then: (resolve: any) => resolve(mockResponse),
    };

    return {
        from: () => mockQuery,
        auth: {
            admin: {
                createUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
                deleteUser: () => Promise.resolve({ data: null, error: null }),
            },
        },
    } as unknown as SupabaseClient;
};

// Admin client with service role key for backend operations
export const supabaseAdmin: SupabaseClient = isConfigured && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : createMockClient();

// For operations that should respect RLS
export const supabase: SupabaseClient = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey)
    : createMockClient();

export default supabaseAdmin;
