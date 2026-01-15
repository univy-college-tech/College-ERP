// ============================================
// Shared Login Form Component
// ============================================

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import type { UserRole } from '@college-erp/types';

// ============================================
// Types
// ============================================

export interface LoginFormProps {
    /** Portal role for branding */
    portalRole: 'admin' | 'professor' | 'student';
    /** Title displayed on the form */
    title?: string;
    /** Subtitle/description */
    subtitle?: string;
    /** On submit handler */
    onSubmit: (email: string, password: string, remember: boolean) => Promise<{
        success: boolean;
        error?: string;
        redirectTo?: string;
    }>;
    /** Loading state (controlled externally) */
    isLoading?: boolean;
    /** Navigate function */
    onNavigate?: (path: string) => void;
    /** Expected roles for this portal */
    allowedRoles?: UserRole[];
}

// ============================================
// Role Configuration
// ============================================

const ROLE_CONFIG = {
    admin: {
        color: 'from-secondary to-primary',
        badge: 'bg-secondary/20 text-secondary',
        label: 'Admin Portal',
        icon: '🔐',
    },
    professor: {
        color: 'from-primary to-secondary',
        badge: 'bg-primary/20 text-primary',
        label: 'Professor Portal',
        icon: '👨‍🏫',
    },
    student: {
        color: 'from-accent-teal to-primary',
        badge: 'bg-accent-teal/20 text-accent-teal',
        label: 'Student Portal',
        icon: '🎓',
    },
};

// ============================================
// Component
// ============================================

export function LoginForm({
    portalRole,
    title,
    subtitle,
    onSubmit,
    isLoading: externalLoading,
    onNavigate,
}: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const config = ROLE_CONFIG[portalRole];
    const isLoading = externalLoading || isSubmitting;

    // Email validation
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
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
            const result = await onSubmit(email, password, remember);

            if (!result.success) {
                setError(result.error || 'Login failed. Please try again.');
            } else if (result.redirectTo && onNavigate) {
                onNavigate(result.redirectTo);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br ${config.color} opacity-10 blur-3xl rounded-full`} />

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                {/* Glass Card */}
                <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8">
                    {/* Role Badge */}
                    <div className="flex justify-center mb-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.badge}`}>
                            <span>{config.icon}</span>
                            {config.label}
                        </span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            {title || 'Welcome Back'}
                        </h1>
                        <p className="text-text-secondary">
                            {subtitle || 'Sign in to continue to your dashboard'}
                        </p>
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
                                    placeholder="you@example.com"
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
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 bg-white/5 border-2 border-white/20 rounded transition-all peer-checked:bg-gradient-to-br peer-checked:from-primary peer-checked:to-secondary peer-checked:border-primary flex items-center justify-center">
                                        {remember && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                    Remember me
                                </span>
                            </label>

                            <button
                                type="button"
                                className="text-sm text-primary hover:text-primary-light transition-colors"
                                onClick={() => onNavigate?.('/forgot-password')}
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 bg-gradient-to-r ${config.color} text-white font-semibold rounded-md shadow-glow-blue transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
                        >
                            {isLoading ? (
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
