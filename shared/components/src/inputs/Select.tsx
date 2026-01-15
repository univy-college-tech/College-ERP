import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    /** Label text */
    label?: string;
    /** Error message */
    error?: string;
    /** Options */
    options: SelectOption[];
    /** Placeholder */
    placeholder?: string;
    /** Select size */
    selectSize?: 'sm' | 'md' | 'lg';
    /** Full width */
    fullWidth?: boolean;
}

/**
 * Select dropdown component
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            options,
            placeholder,
            selectSize = 'md',
            fullWidth = true,
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

        const sizes = {
            sm: 'py-2 text-sm',
            md: 'py-3 text-sm',
            lg: 'py-4 text-base',
        };

        return (
            <div className={cn(fullWidth && 'w-full', 'space-y-1.5')}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-text-secondary"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'w-full',
                            'px-4 pr-10',
                            sizes[selectSize],
                            'bg-white/5',
                            'border',
                            error ? 'border-error' : 'border-white/10',
                            'rounded-md',
                            'text-text-primary',
                            'appearance-none',
                            'transition-all duration-200 ease-out',
                            'focus:outline-none focus:border-primary focus:bg-white/10',
                            'focus:ring-2 focus:ring-primary/20',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'cursor-pointer',
                            className
                        )}
                        aria-invalid={!!error}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="bg-bg-secondary text-text-primary"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>

                {error && (
                    <p className="text-sm text-error" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
