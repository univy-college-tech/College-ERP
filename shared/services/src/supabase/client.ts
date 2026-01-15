// ============================================
// Supabase Client Factory
// ============================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseClientConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Create a Supabase client instance
 * Should be called once at app initialization
 */
export function createSupabaseClient(config: SupabaseClientConfig): SupabaseClient {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error(
            'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
        );
    }

    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            storageKey: 'college-erp-auth',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
    });

    return supabaseInstance;
}

/**
 * Get existing Supabase client instance
 * Throws if not initialized
 */
export function getSupabaseClient(): SupabaseClient {
    if (!supabaseInstance) {
        throw new Error(
            'Supabase client not initialized. Call createSupabaseClient() first.'
        );
    }
    return supabaseInstance;
}

/**
 * Reset client (for testing or logout)
 */
export function resetSupabaseClient(): void {
    supabaseInstance = null;
}
