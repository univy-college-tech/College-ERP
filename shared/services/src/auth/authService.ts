// ============================================
// Authentication Service
// ============================================

import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@college-erp/types';
import { getSupabaseClient } from '../supabase/client';

// ============================================
// Types
// ============================================

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
}

export interface SignInParams {
    email: string;
    password: string;
}

export interface SignUpParams {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
}

export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    session?: Session;
    error?: string;
}

// ============================================
// Portal URLs by Role
// ============================================

const PORTAL_URLS: Record<UserRole, string> = {
    admin: '/admin',
    professor: '/professor',
    student: '/student',
    dean: '/admin',
    student_cell: '/admin',
    staff: '/admin',
};

// ============================================
// Auth Service
// ============================================

export interface AuthService {
    signIn: (params: SignInParams) => Promise<AuthResult>;
    signUp: (params: SignUpParams) => Promise<AuthResult>;
    signOut: () => Promise<{ success: boolean; error?: string }>;
    getCurrentUser: () => Promise<AuthUser | null>;
    getUserRole: () => Promise<UserRole | null>;
    getSession: () => Promise<Session | null>;
    isAuthenticated: () => Promise<boolean>;
    refreshSession: () => Promise<Session | null>;
    getPortalUrl: (role: UserRole) => string;
    onAuthStateChange: (callback: (user: AuthUser | null) => void) => () => void;
}

/**
 * Authentication Service implementation
 */
export const authService: AuthService = {
    /**
     * Sign in with email and password
     */
    async signIn({ email, password }: SignInParams): Promise<AuthResult> {
        try {
            const supabase = getSupabaseClient();

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (!data.user || !data.session) {
                return { success: false, error: 'Authentication failed' };
            }

            // Get user profile with role
            const authUser = await authService.getCurrentUser();

            if (!authUser) {
                return { success: false, error: 'User profile not found' };
            }

            if (!authUser.isActive) {
                await supabase.auth.signOut();
                return { success: false, error: 'Account is deactivated. Please contact admin.' };
            }

            return {
                success: true,
                user: authUser,
                session: data.session,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Sign in failed',
            };
        }
    },

    /**
     * Sign up new user (admin-only operation in production)
     */
    async signUp({ email, password, fullName, role, phone }: SignUpParams): Promise<AuthResult> {
        try {
            const supabase = getSupabaseClient();

            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, role },
                },
            });

            if (authError) {
                return { success: false, error: authError.message };
            }

            if (!authData.user) {
                return { success: false, error: 'User creation failed' };
            }

            // Create user profile in users table
            const { error: profileError } = await supabase.from('users').insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                role,
                phone,
                is_active: true,
            });

            if (profileError) {
                // Rollback: delete auth user if profile creation fails
                console.error('Failed to create user profile:', profileError);
                return { success: false, error: 'Failed to create user profile' };
            }

            return {
                success: true,
                user: {
                    id: authData.user.id,
                    email,
                    fullName,
                    role,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                session: authData.session ?? undefined,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Sign up failed',
            };
        }
    },

    /**
     * Sign out current user
     */
    async signOut(): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = getSupabaseClient();
            const { error } = await supabase.auth.signOut();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Sign out failed',
            };
        }
    },

    /**
     * Get current authenticated user with profile
     */
    async getCurrentUser(): Promise<AuthUser | null> {
        try {
            const supabase = getSupabaseClient();

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return null;
            }

            // Get user profile from users table
            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error || !profile) {
                console.error('Failed to fetch user profile:', error);
                return null;
            }

            return {
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                role: profile.role as UserRole,
                isActive: profile.is_active,
                createdAt: profile.created_at,
            };
        } catch (err) {
            console.error('getCurrentUser error:', err);
            return null;
        }
    },

    /**
     * Get current user's role
     */
    async getUserRole(): Promise<UserRole | null> {
        const user = await authService.getCurrentUser();
        return user?.role ?? null;
    },

    /**
     * Get current session
     */
    async getSession(): Promise<Session | null> {
        try {
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            return session;
        } catch {
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const session = await authService.getSession();
        return session !== null;
    },

    /**
     * Refresh the current session
     */
    async refreshSession(): Promise<Session | null> {
        try {
            const supabase = getSupabaseClient();
            const { data: { session }, error } = await supabase.auth.refreshSession();

            if (error) {
                console.error('Session refresh failed:', error);
                return null;
            }

            return session;
        } catch {
            return null;
        }
    },

    /**
     * Get portal URL for a given role
     */
    getPortalUrl(role: UserRole): string {
        return PORTAL_URLS[role] || '/login';
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
        const supabase = getSupabaseClient();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
                    callback(null);
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    const user = await authService.getCurrentUser();
                    callback(user);
                }
            }
        );

        return () => subscription.unsubscribe();
    },
};
