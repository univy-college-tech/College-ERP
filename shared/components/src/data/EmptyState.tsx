import { type ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from '../buttons/Button';

export interface EmptyStateProps {
    /** Icon to display */
    icon?: ReactNode;
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Primary action button */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Additional class name */
    className?: string;
}

/**
 * Empty state component for when there's no data
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'py-12 px-4',
                'text-center',
                className
            )}
        >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                {icon || <FileQuestion className="w-8 h-8 text-text-muted" />}
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>

            {description && (
                <p className="text-sm text-text-secondary max-w-sm mb-6">
                    {description}
                </p>
            )}

            {action && (
                <Button onClick={action.onClick} size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
