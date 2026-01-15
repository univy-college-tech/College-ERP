import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Label text */
    label?: string;
    /** Error message */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Left icon */
    leftIcon?: ReactNode;
    /** Right icon */
    rightIcon?: ReactNode;
    /** Input size */
    inputSize?: 'sm' | 'md' | 'lg';
    /** Full width */
    fullWidth?: boolean;
}

/**
 * Text input component with label and error states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            inputSize = 'md',
            fullWidth = true,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

        const sizes = {
            sm: 'py-2 text-sm',
            md: 'py-3 text-sm',
            lg: 'py-4 text-base',
        };

        return (
            <div className={cn(fullWidth && 'w-full', 'space-y-1.5')}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-secondary"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {leftIcon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'w-full',
                            'px-4',
                            sizes[inputSize],
                            'bg-white/5',
                            'border',
                            error ? 'border-error' : 'border-white/10',
                            'rounded-md',
                            'text-text-primary',
                            'placeholder:text-text-muted',
                            'transition-all duration-200 ease-out',
                            'focus:outline-none focus:border-primary focus:bg-white/10',
                            'focus:ring-2 focus:ring-primary/20',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        {...props}
                    />

                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {error && (
                    <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="text-sm text-text-muted">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
