import { cn } from '../utils/cn';

export interface AvatarProps {
    /** Name for initials fallback */
    name?: string;
    /** Image URL */
    src?: string;
    /** Alt text */
    alt?: string;
    /** Size */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Color theme */
    color?: 'primary' | 'teal' | 'indigo' | 'orange' | 'auto';
    /** Additional class name */
    className?: string;
}

/**
 * Avatar component with initials fallback
 */
export function Avatar({
    name,
    src,
    alt,
    size = 'md',
    color = 'primary',
    className,
}: AvatarProps) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const colors = {
        primary: 'bg-primary/20 text-primary',
        teal: 'bg-accent-teal/20 text-accent-teal',
        indigo: 'bg-secondary/20 text-secondary',
        orange: 'bg-accent-orange/20 text-accent-orange',
        auto: '',
    };

    // Generate color from name
    const getAutoColor = () => {
        if (!name) return colors.primary;
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorKeys = ['primary', 'teal', 'indigo', 'orange'] as const;
        const colorKey = colorKeys[hash % colorKeys.length] ?? 'primary';
        return colors[colorKey];
    };

    const getInitials = () => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const effectiveColor = color === 'auto' ? getAutoColor() : colors[color];

    if (src) {
        return (
            <img
                src={src}
                alt={alt || name || 'Avatar'}
                className={cn(
                    'rounded-full object-cover',
                    sizes[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-semibold',
                sizes[size],
                effectiveColor,
                className
            )}
            aria-label={alt || name || 'Avatar'}
        >
            {getInitials()}
        </div>
    );
}
