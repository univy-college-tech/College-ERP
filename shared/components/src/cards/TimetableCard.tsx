import { type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface TimetableCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Subject name */
    subject: string;
    /** Class label (e.g., CSE-A) */
    classLabel?: string;
    /** Start time */
    startTime: string;
    /** End time */
    endTime: string;
    /** Room number */
    room?: string;
    /** Card type for color coding */
    type?: 'theory' | 'lab' | 'break' | 'free';
    /** Professor name (for student view) */
    professorName?: string;
    /** Is current class */
    isCurrent?: boolean;
}

/**
 * Timetable slot card component
 */
export function TimetableCard({
    className,
    subject,
    classLabel,
    startTime,
    endTime,
    room,
    type = 'theory',
    professorName,
    isCurrent = false,
    ...props
}: TimetableCardProps) {
    const typeColors = {
        theory: 'border-l-primary',
        lab: 'border-l-accent-teal',
        break: 'border-l-neutral-500',
        free: 'border-l-neutral-700',
    };

    const typeBgs = {
        theory: 'from-primary/5 to-secondary/5',
        lab: 'from-accent-teal/5 to-accent-emerald/5',
        break: 'from-neutral-500/5 to-neutral-600/5',
        free: 'from-neutral-700/5 to-neutral-800/5',
    };

    return (
        <div
            className={cn(
                'relative',
                'bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95',
                'backdrop-blur-xl',
                'border border-white/10',
                'border-l-4',
                typeColors[type],
                'rounded-md',
                'p-4',
                'shadow-[0_4px_16px_rgba(0,102,255,0.15)]',
                'transition-all duration-200 ease-out',
                isCurrent && 'ring-2 ring-primary/50 bg-gradient-to-br',
                isCurrent && typeBgs[type],
                className
            )}
            {...props}
        >
            {isCurrent && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                    Now
                </span>
            )}

            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{subject}</h3>
                    {classLabel && (
                        <p className="text-sm text-text-secondary mt-0.5">{classLabel}</p>
                    )}
                    {professorName && (
                        <p className="text-sm text-text-tertiary mt-0.5">{professorName}</p>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-text-primary">
                        {startTime} - {endTime}
                    </p>
                    {room && <p className="text-xs text-text-muted mt-0.5">Room {room}</p>}
                </div>
            </div>
        </div>
    );
}
