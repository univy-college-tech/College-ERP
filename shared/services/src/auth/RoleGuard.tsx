// ============================================
// Role Guard Component
// ============================================

import { type ReactNode } from 'react';
import type { UserRole } from '@college-erp/types';
import { useAuth } from './AuthContext';

export interface RoleGuardProps {
    /** Children to render if role matches */
    children: ReactNode;
    /** Required role(s) */
    allowedRoles: UserRole | UserRole[];
    /** Component to show when role doesn't match */
    fallback?: ReactNode;
    /** Component to show while loading */
    loadingComponent?: ReactNode;
    /** Redirect path when role doesn't match */
    redirectTo?: string;
    /** Custom redirect function */
    onRedirect?: (path: string) => void;
}

/**
 * Guards routes/components based on user role
 * Shows fallback or redirects if user doesn't have required role
 */
export function RoleGuard({
    children,
    allowedRoles,
    fallback,
    loadingComponent,
    redirectTo,
    onRedirect,
}: RoleGuardProps) {
    const { user, isLoading, hasRole, isAuthenticated } = useAuth();

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

    // Not authenticated
    if (!isAuthenticated || !user) {
        if (redirectTo && onRedirect) {
            onRedirect(redirectTo);
        }
        return fallback ? <>{fallback}</> : null;
    }

    // Check role
    const hasRequiredRole = hasRole(allowedRoles);

    if (!hasRequiredRole) {
        // Redirect if specified
        if (redirectTo) {
            if (onRedirect) {
                onRedirect(redirectTo);
            } else if (typeof window !== 'undefined') {
                window.location.href = redirectTo;
            }
            return null;
        }

        // Show fallback
        return fallback ? (
            <>{fallback}</>
        ) : (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        Access Denied
                    </h1>
                    <p className="text-text-secondary">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
