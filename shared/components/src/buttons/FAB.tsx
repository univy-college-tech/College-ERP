import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon to display */
    icon: ReactNode;
    /** Accessible label */
    'aria-label': string;
    /** Position from bottom */
    bottomOffset?: number;
    /** Extended mode with label */
    extended?: boolean;
    /** Label for extended mode */
    label?: string;
}

/**
 * Floating Action Button for primary actions
 */
export const FAB = forwardRef<HTMLButtonElement, FABProps>(
    (
        {
            className,
            icon,
            bottomOffset = 80,
            extended = false,
            label,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'fixed right-5 z-50',
                    'flex items-center justify-center gap-2',
                    'bg-gradient-to-r from-primary to-secondary',
                    'text-white font-semibold',
                    'rounded-full',
                    'shadow-[0_6px_20px_rgba(0,102,255,0.4)]',
                    'transition-all duration-300 ease-out',
                    'hover:scale-110 hover:shadow-[0_8px_28px_rgba(0,102,255,0.5)]',
                    'active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-bg-primary',
                    extended ? 'px-6 h-14' : 'w-14 h-14',
                    className
                )}
                style={{ bottom: bottomOffset }}
                {...props}
            >
                {icon}
                {extended && label && <span>{label}</span>}
            </button>
        );
    }
);

FAB.displayName = 'FAB';
