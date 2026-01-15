// ============================================
// College ERP Shared Services
// ============================================

// Auth Service
export {
    authService,
    type AuthService,
    type SignInParams,
    type SignUpParams,
    type AuthUser,
} from './auth/authService';

// Auth Context & Hooks
export {
    AuthProvider,
    useAuth,
    type AuthContextValue,
} from './auth/AuthContext';

// Auth Guards
export { ProtectedRoute } from './auth/ProtectedRoute';
export { RoleGuard, type RoleGuardProps } from './auth/RoleGuard';

// Supabase Client
export {
    createSupabaseClient,
    getSupabaseClient,
    type SupabaseClientConfig,
} from './supabase/client';
