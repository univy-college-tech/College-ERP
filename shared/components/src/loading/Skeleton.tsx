import { cn } from '../utils/cn';

export interface SkeletonProps {
    /** Skeleton variant */
    variant?: 'text' | 'circular' | 'rectangular';
    /** Width (use Tailwind classes or CSS) */
    width?: string;
    /** Height (use Tailwind classes or CSS) */
    height?: string;
    /** Number of text lines */
    lines?: number;
    /** Additional class name */
    className?: string;
}

/**
 * Skeleton loading placeholder
 */
export function Skeleton({
    variant = 'rectangular',
    width,
    height,
    lines = 1,
    className,
}: SkeletonProps) {
    const baseClasses = `
    animate-shimmer
    bg-gradient-to-r from-white/5 via-white/10 to-white/5
    bg-[length:200%_100%]
  `;

    const variants = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };

    if (variant === 'text' && lines > 1) {
        return (
            <div className={cn('space-y-2', className)}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            baseClasses,
                            variants.text,
                            i === lines - 1 && 'w-3/4' // Last line shorter
                        )}
                        style={{ width: i === lines - 1 ? '75%' : width, height }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseClasses, variants[variant], className)}
            style={{ width, height }}
        />
    );
}

/**
 * Pre-built skeleton for cards
 */
export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'bg-bg-secondary/50 rounded-lg p-4 space-y-4',
                className
            )}
        >
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-1/2" />
                    <Skeleton variant="text" className="w-1/3 h-3" />
                </div>
            </div>
            <Skeleton variant="text" lines={3} />
        </div>
    );
}

/**
 * Pre-built skeleton for table rows
 */
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-white/5">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton variant="text" className="w-full" />
                </td>
            ))}
        </tr>
    );
}
