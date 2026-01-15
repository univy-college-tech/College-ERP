import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Card variant */
    variant?: 'default' | 'elevated' | 'interactive';
    /** Padding size */
    padding?: 'sm' | 'md' | 'lg' | 'none';
    /** Border accent color */
    accent?: 'none' | 'primary' | 'success' | 'warning' | 'error' | 'teal';
    /** Children */
    children: ReactNode;
}

/**
 * Base card component with glassmorphism effect
 */
export function Card({
    className,
    variant = 'default',
    padding = 'md',
    accent = 'none',
    children,
    ...props
}: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const variants = {
        default: `
      bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95
      backdrop-blur-xl
      border border-white/10
      rounded-lg
      shadow-card
    `,
        elevated: `
      bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95
      backdrop-blur-xl
      border border-white/10
      rounded-lg
      shadow-elevated
    `,
        interactive: `
      bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95
      backdrop-blur-xl
      border border-white/10
      rounded-lg
      shadow-card
      transition-all duration-200 ease-out
      hover:shadow-elevated
      hover:border-primary/30
      hover:-translate-y-1
      cursor-pointer
    `,
    };

    const accents = {
        none: '',
        primary: 'border-l-4 border-l-primary',
        success: 'border-l-4 border-l-success',
        warning: 'border-l-4 border-l-warning',
        error: 'border-l-4 border-l-error',
        teal: 'border-l-4 border-l-accent-teal',
    };

    return (
        <div
            className={cn(variants[variant], paddings[padding], accents[accent], className)}
            {...props}
        >
            {children}
        </div>
    );
}
