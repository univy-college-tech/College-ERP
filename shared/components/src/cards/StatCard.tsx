import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../utils/cn';

export interface StatCardProps {
    /** Stat label */
    label: string;
    /** Stat value */
    value: string | number;
    /** Icon */
    icon?: ReactNode;
    /** Color theme */
    color?: 'primary' | 'teal' | 'indigo' | 'orange' | 'success' | 'error';
    /** Trend percentage */
    trend?: number;
    /** Trend label */
    trendLabel?: string;
    /** Additional class name */
    className?: string;
}

/**
 * Statistics card for dashboard displays
 */
export function StatCard({
    label,
    value,
    icon,
    color = 'primary',
    trend,
    trendLabel,
    className,
}: StatCardProps) {
    const colors = {
        primary: { bg: 'bg-primary/20', text: 'text-primary' },
        teal: { bg: 'bg-accent-teal/20', text: 'text-accent-teal' },
        indigo: { bg: 'bg-secondary/20', text: 'text-secondary' },
        orange: { bg: 'bg-accent-orange/20', text: 'text-accent-orange' },
        success: { bg: 'bg-success/20', text: 'text-success' },
        error: { bg: 'bg-error/20', text: 'text-error' },
    };

    const getTrendIcon = () => {
        if (!trend) return <Minus className="w-4 h-4" />;
        if (trend > 0) return <TrendingUp className="w-4 h-4" />;
        return <TrendingDown className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (!trend) return 'text-text-muted';
        if (trend > 0) return 'text-success';
        return 'text-error';
    };

    return (
        <div
            className={cn(
                'bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95',
                'backdrop-blur-xl',
                'border border-white/10',
                'rounded-lg',
                'p-5',
                'shadow-card',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-text-secondary text-sm">{label}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
                </div>
                {icon && (
                    <div className={cn('p-3 rounded-lg', colors[color].bg)}>
                        <span className={colors[color].text}>{icon}</span>
                    </div>
                )}
            </div>

            {(trend !== undefined || trendLabel) && (
                <div className={cn('mt-3 flex items-center gap-1 text-sm', getTrendColor())}>
                    {getTrendIcon()}
                    <span>
                        {trend !== undefined && `${trend > 0 ? '+' : ''}${trend}%`}
                        {trendLabel && ` ${trendLabel}`}
                    </span>
                </div>
            )}
        </div>
    );
}
