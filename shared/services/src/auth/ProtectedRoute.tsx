// ============================================
// Protected Route Component
// ============================================

import { type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Component to show while loading */
    loadingComponent?: ReactNode;
    /** Redirect path when not authenticated */
    redirectTo?: string;
    /** Custom redirect function */
    onRedirect?: (path: string) => void;
}

/**
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({
    children,
    loadingComponent,
    redirectTo = '/login',
    onRedirect,
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state
    if (isLoading) {
        return loadingComponent ? (
            <>{loadingComponent}</>
        ) : (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        if (onRedirect) {
            onRedirect(redirectTo);
        } else if (typeof window !== 'undefined') {
            window.location.href = redirectTo;
        }
        return null;
    }

    return <>{children}</>;
}
