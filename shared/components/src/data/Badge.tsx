import { cn } from '../utils/cn';

export interface BadgeProps {
    /** Badge content */
    children: React.ReactNode;
    /** Badge variant */
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    /** Badge size */
    size?: 'sm' | 'md';
    /** Additional class name */
    className?: string;
}

/**
 * Badge/tag component for status indicators
 */
export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className,
}: BadgeProps) {
    const variants = {
        default: 'bg-white/10 text-text-primary',
        success: 'bg-success/20 text-success',
        warning: 'bg-warning/20 text-warning',
        error: 'bg-error/20 text-error',
        info: 'bg-info/20 text-info',
        outline: 'bg-transparent border border-white/20 text-text-secondary',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center',
                'font-medium',
                'rounded-full',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
}
