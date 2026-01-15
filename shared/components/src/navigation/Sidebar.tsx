import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

export interface SidebarItem {
    icon: ReactNode;
    label: string;
    href: string;
    badge?: number;
}

export interface SidebarProps {
    items: SidebarItem[];
    activeHref: string;
    onNavigate: (href: string) => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    logo?: ReactNode;
    className?: string;
}

/**
 * Desktop sidebar navigation component
 */
export function Sidebar({
    items,
    activeHref,
    onNavigate,
    collapsed = false,
    onToggleCollapse,
    logo,
    className,
}: SidebarProps) {
    return (
        <aside
            className={cn(
                'h-screen',
                'bg-bg-secondary',
                'border-r border-white/10',
                'flex flex-col',
                'transition-all duration-300 ease-out',
                collapsed ? 'w-20' : 'w-64',
                className
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-white/10 px-4">
                {logo || (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        {!collapsed && (
                            <span className="font-semibold text-lg text-text-primary">
                                College ERP
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1" role="navigation">
                {items.map((item) => {
                    const isActive = activeHref === item.href;

                    return (
                        <button
                            key={item.href}
                            onClick={() => onNavigate(item.href)}
                            className={cn(
                                'relative w-full flex items-center gap-3',
                                'px-4 py-3',
                                'rounded-md',
                                'font-medium',
                                'transition-all duration-200 ease-out',
                                'cursor-pointer',
                                collapsed && 'justify-center',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                            )}
                            title={collapsed ? item.label : undefined}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}

                            {/* Badge */}
                            {item.badge !== undefined && item.badge > 0 && (
                                <span
                                    className={cn(
                                        'flex items-center justify-center',
                                        'min-w-[20px] h-5 px-1.5',
                                        'bg-error text-white text-xs font-medium rounded-full',
                                        collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                                    )}
                                >
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            {onToggleCollapse && (
                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={onToggleCollapse}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-md hover:bg-white/5 text-text-secondary transition-colors"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </aside>
    );
}
