// ============================================
// Auth Context & Provider
// ============================================

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@college-erp/types';
import { authService, type AuthUser, type SignInParams } from './authService';

// ============================================
// Context Types
// ============================================

export interface AuthContextValue {
    /** Current authenticated user */
    user: AuthUser | null;
    /** Current session */
    session: Session | null;
    /** Loading state */
    isLoading: boolean;
    /** Is user authenticated */
    isAuthenticated: boolean;
    /** Sign in with email/password */
    signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
    /** Sign out */
    signOut: () => Promise<void>;
    /** Refresh session */
    refreshSession: () => Promise<void>;
    /** Check if user has specific role */
    hasRole: (role: UserRole | UserRole[]) => boolean;
    /** Get portal URL for current user */
    getPortalUrl: () => string;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// Provider Props
// ============================================

interface AuthProviderProps {
    children: ReactNode;
    /** Optional loading component */
    loadingComponent?: ReactNode;
    /** Callback when auth state changes */
    onAuthStateChange?: (user: AuthUser | null) => void;
}

// ============================================
// Provider Component
// ============================================

export function AuthProvider({
    children,
    loadingComponent,
    onAuthStateChange,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const [currentSession, currentUser] = await Promise.all([
                    authService.getSession(),
                    authService.getCurrentUser(),
                ]);

                if (mounted) {
                    setSession(currentSession);
                    setUser(currentUser);
                    onAuthStateChange?.(currentUser);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initAuth();

        // Subscribe to auth changes
        const unsubscribe = authService.onAuthStateChange((authUser) => {
            if (mounted) {
                setUser(authUser);
                onAuthStateChange?.(authUser);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [onAuthStateChange]);

    // Sign in handler
    const signIn = useCallback(async (params: SignInParams) => {
        setIsLoading(true);
        try {
            const result = await authService.signIn(params);

            if (result.success && result.user && result.session) {
                setUser(result.user);
                setSession(result.session);
                return { success: true };
            }

            return { success: false, error: result.error };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign out handler
    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await authService.signOut();
            setUser(null);
            setSession(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh session
    const refreshSession = useCallback(async () => {
        const newSession = await authService.refreshSession();
        if (newSession) {
            setSession(newSession);
            const updatedUser = await authService.getCurrentUser();
            setUser(updatedUser);
        }
    }, []);

    // Check if user has role(s)
    const hasRole = useCallback(
        (role: UserRole | UserRole[]) => {
            if (!user) return false;
            const roles = Array.isArray(role) ? role : [role];
            return roles.includes(user.role);
        },
        [user]
    );

    // Get portal URL for current user
    const getPortalUrl = useCallback(() => {
        if (!user) return '/login';
        return authService.getPortalUrl(user.role);
    }, [user]);

    // Context value
    const value: AuthContextValue = {
        user,
        session,
        isLoading,
        isAuthenticated: !!user && !!session,
        signIn,
        signOut,
        refreshSession,
        hasRole,
        getPortalUrl,
    };

    // Show loading state
    if (isLoading && loadingComponent) {
        return <>{loadingComponent}</>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
