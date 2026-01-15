// ============================================
// Student Portal - Auth Context
// ============================================

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js';

interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
}

interface AuthContextValue {
    user: AuthUser | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (params: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (!supabase && supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { autoRefreshToken: true, persistSession: true, storageKey: 'student-portal-auth' },
        });
    }
    return supabase as SupabaseClient;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async (authUser: User): Promise<AuthUser | null> => {
        try {
            const { data } = await getSupabase()?.from('users').select('*').eq('id', authUser.id).single();
            if (!data) return null;
            return { id: data.id, email: data.email, fullName: data.full_name, role: data.role, isActive: data.is_active };
        } catch { return null; }
    }, []);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                const { data: { session: s } } = await getSupabase()?.auth.getSession() || { data: { session: null } };
                if (mounted && s?.user) {
                    setSession(s);
                    setUser(await fetchProfile(s.user));
                }
            } finally { if (mounted) setIsLoading(false); }
        };
        init();
        const { data: { subscription } } = getSupabase()?.auth.onAuthStateChange(async (_, s) => {
            if (mounted) {
                setSession(s);
                setUser(s?.user ? await fetchProfile(s.user) : null);
            }
        }) || { data: { subscription: { unsubscribe: () => { } } } };
        return () => { mounted = false; subscription.unsubscribe(); };
    }, [fetchProfile]);

    const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            const { data, error } = await getSupabase()?.auth.signInWithPassword({ email, password }) || { data: null, error: { message: 'Not configured' } };
            if (error) return { success: false, error: error.message };
            if (!data?.session) return { success: false, error: 'Auth failed' };
            const profile = await fetchProfile(data.user!);
            if (!profile) return { success: false, error: 'Profile not found' };
            if (profile.role !== 'student') {
                await getSupabase()?.auth.signOut();
                return { success: false, error: 'Access denied. Student account required.' };
            }
            setSession(data.session);
            setUser(profile);
            return { success: true };
        } finally { setIsLoading(false); }
    }, [fetchProfile]);

    const signOut = useCallback(async () => {
        await getSupabase()?.auth.signOut();
        setUser(null);
        setSession(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, isLoading, isAuthenticated: !!user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
