// ============================================
// Admin Portal - Login Page
// ============================================

import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location]);

    const isLoading = authLoading || isSubmitting;

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await signIn({ email, password });

            if (result.success) {
                const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading during initial auth check
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="animate-spin w-10 h-10 border-3 border-secondary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-secondary to-primary opacity-10 blur-3xl rounded-full" />

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8">
                    {/* Role Badge */}
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-secondary/20 text-secondary">
                            <span>🔐</span>
                            Admin Portal
                        </span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h1>
                        <p className="text-text-secondary">Sign in to manage your college ERP</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-lg text-error">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@college.edu"
                                    disabled={isLoading}
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-md text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-primary focus:bg-white/10 focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-md text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-primary focus:bg-white/10 focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                                />
                                <span className="text-sm text-text-secondary">Remember me</span>
                            </label>
                            <button type="button" className="text-sm text-primary hover:text-primary-light transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-md shadow-glow-indigo transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-text-muted text-sm mt-6">
                    College ERP System • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
