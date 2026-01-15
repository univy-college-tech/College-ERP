import { type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface NavItem {
    icon: ReactNode;
    label: string;
    href: string;
    badge?: number;
}

export interface BottomNavProps {
    items: NavItem[];
    activeHref: string;
    onNavigate: (href: string) => void;
    className?: string;
}

/**
 * Mobile bottom navigation component
 */
export function BottomNav({
    items,
    activeHref,
    onNavigate,
    className,
}: BottomNavProps) {
    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50',
                'h-16',
                'bg-bg-secondary/98 backdrop-blur-xl',
                'border-t border-white/10',
                'flex justify-around items-center',
                'px-4',
                'safe-area-pb',
                className
            )}
            role="navigation"
            aria-label="Main navigation"
        >
            {items.map((item) => {
                const isActive = activeHref === item.href;

                return (
                    <button
                        key={item.href}
                        onClick={() => onNavigate(item.href)}
                        className={cn(
                            'relative flex flex-col items-center gap-1',
                            'px-4 py-2',
                            'transition-all duration-200 ease-out',
                            isActive ? 'text-primary' : 'text-text-tertiary',
                            'hover:text-primary'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {/* Badge */}
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="absolute -top-1 right-2 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-error text-white text-xs font-medium rounded-full">
                                {item.badge > 99 ? '99+' : item.badge}
                            </span>
                        )}

                        {/* Icon */}
                        <span className="text-xl">{item.icon}</span>

                        {/* Label */}
                        <span className="text-xs font-medium">{item.label}</span>

                        {/* Active indicator */}
                        {isActive && (
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
