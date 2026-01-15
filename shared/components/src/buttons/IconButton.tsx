import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon to display */
    icon: ReactNode;
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Accessible label */
    'aria-label': string;
    /** Variant */
    variant?: 'default' | 'ghost' | 'primary';
}

/**
 * Icon-only button for actions
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, icon, size = 'md', variant = 'default', ...props }, ref) => {
        const sizes = {
            sm: 'w-8 h-8',
            md: 'w-10 h-10',
            lg: 'w-12 h-12',
        };

        const variants = {
            default: `
        bg-white/5 border border-white/10
        hover:bg-white/10 hover:border-white/20
        text-text-secondary hover:text-text-primary
      `,
            ghost: `
        bg-transparent
        hover:bg-white/5
        text-text-secondary hover:text-text-primary
      `,
            primary: `
        bg-primary/20
        hover:bg-primary/30
        text-primary
      `,
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center',
                    'rounded-full',
                    'transition-all duration-200 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    sizes[size],
                    variants[variant],
                    className
                )}
                {...props}
            >
                {icon}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';
