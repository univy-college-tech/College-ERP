import { cn } from '../utils/cn';

export interface ProgressBarProps {
    /** Progress value (0-100) */
    value: number;
    /** Max value */
    max?: number;
    /** Color variant */
    color?: 'primary' | 'success' | 'warning' | 'error' | 'auto';
    /** Size */
    size?: 'sm' | 'md' | 'lg';
    /** Show percentage text */
    showValue?: boolean;
    /** Animate on mount */
    animate?: boolean;
    /** Additional class name */
    className?: string;
}

/**
 * Progress bar component for attendance, completion, etc.
 */
export function ProgressBar({
    value,
    max = 100,
    color = 'primary',
    size = 'md',
    showValue = false,
    animate = true,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // Auto color based on percentage (for attendance)
    const getAutoColor = () => {
        if (percentage >= 75) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const effectiveColor = color === 'auto' ? getAutoColor() : color;

    const colors = {
        primary: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
    };

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={cn('w-full', className)}>
            {showValue && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm text-text-secondary">Progress</span>
                    <span className="text-sm font-medium text-text-primary">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div
                className={cn(
                    'w-full bg-white/10 rounded-full overflow-hidden',
                    sizes[size]
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <div
                    className={cn(
                        colors[effectiveColor],
                        'h-full rounded-full',
                        animate && 'transition-all duration-500 ease-out'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
