import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../utils/cn';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** Show clear button */
    showClear?: boolean;
    /** On clear callback */
    onClear?: () => void;
    /** Full width */
    fullWidth?: boolean;
}

/**
 * Search input with icon and clear button
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            className,
            showClear = false,
            onClear,
            fullWidth = true,
            value,
            ...props
        },
        ref
    ) => {
        const hasValue = value !== undefined && value !== '';

        return (
            <div className={cn('relative', fullWidth && 'w-full')}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />

                <input
                    ref={ref}
                    type="search"
                    value={value}
                    className={cn(
                        'w-full',
                        'pl-10 pr-10 py-3',
                        'bg-white/5',
                        'border border-white/10',
                        'rounded-md',
                        'text-text-primary text-sm',
                        'placeholder:text-text-muted',
                        'transition-all duration-200 ease-out',
                        'focus:outline-none focus:border-primary focus:bg-white/10',
                        'focus:ring-2 focus:ring-primary/20',
                        '[&::-webkit-search-cancel-button]:hidden',
                        className
                    )}
                    {...props}
                />

                {showClear && hasValue && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';
