import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Loading state */
    isLoading?: boolean;
    /** Left icon */
    leftIcon?: ReactNode;
    /** Right icon */
    rightIcon?: ReactNode;
    /** Full width */
    fullWidth?: boolean;
}

/**
 * Primary UI button component
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    `;

        const variants = {
            primary: `
        bg-gradient-to-r from-primary to-secondary
        text-white
        shadow-glow-blue
        hover:-translate-y-0.5 hover:shadow-elevated
        active:scale-95
        focus:ring-primary
      `,
            secondary: `
        bg-transparent
        border border-primary/30
        text-primary
        hover:bg-primary/10 hover:border-primary
        focus:ring-primary
      `,
            ghost: `
        bg-transparent
        text-text-secondary
        hover:bg-white/5 hover:text-text-primary
        focus:ring-white/20
      `,
            danger: `
        bg-error
        text-white
        shadow-[0_4px_16px_rgba(239,68,68,0.3)]
        hover:-translate-y-0.5
        active:scale-95
        focus:ring-error
      `,
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-md',
            md: 'px-4 py-2.5 text-sm rounded-md',
            lg: 'px-6 py-3 text-base rounded-lg',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="flex-shrink-0">{leftIcon}</span>
                ) : null}
                {children}
                {!isLoading && rightIcon && (
                    <span className="flex-shrink-0">{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
