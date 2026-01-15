import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /** Label text */
    label?: string;
    /** Checkbox size */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Checkbox component for attendance and selections
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, size = 'md', id, ...props }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

        const sizes = {
            sm: 'w-5 h-5',
            md: 'w-6 h-6',
            lg: 'w-8 h-8',
        };

        const iconSizes = {
            sm: 'w-3 h-3',
            md: 'w-4 h-4',
            lg: 'w-5 h-5',
        };

        return (
            <label
                htmlFor={checkboxId}
                className={cn(
                    'inline-flex items-center gap-3 cursor-pointer group',
                    props.disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <div className="relative">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={checkboxId}
                        className="sr-only peer"
                        {...props}
                    />
                    <div
                        className={cn(
                            sizes[size],
                            'bg-white/5',
                            'border-2 border-white/20',
                            'rounded-md',
                            'transition-all duration-200 ease-out',
                            'flex items-center justify-center',
                            'peer-checked:bg-gradient-to-br peer-checked:from-primary peer-checked:to-secondary',
                            'peer-checked:border-primary',
                            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-primary',
                            'group-hover:border-white/30',
                            className
                        )}
                    >
                        <Check
                            className={cn(
                                iconSizes[size],
                                'text-white',
                                'opacity-0 scale-50',
                                'transition-all duration-200 ease-out',
                                'peer-checked:opacity-100 peer-checked:scale-100'
                            )}
                            strokeWidth={3}
                        />
                    </div>
                </div>
                {label && (
                    <span className="text-sm text-text-primary select-none">{label}</span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';
