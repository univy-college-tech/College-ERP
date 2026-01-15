import { type ReactNode } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { cn } from '../utils/cn';
import { IconButton } from '../buttons/IconButton';

export interface TopBarProps {
    /** Title or breadcrumb */
    title?: string;
    /** User name */
    userName?: string;
    /** User role */
    userRole?: string;
    /** User avatar */
    avatar?: ReactNode;
    /** Notification count */
    notificationCount?: number;
    /** On menu click (mobile) */
    onMenuClick?: () => void;
    /** On notification click */
    onNotificationClick?: () => void;
    /** On profile click */
    onProfileClick?: () => void;
    /** Show menu button */
    showMenuButton?: boolean;
    /** Left content (breadcrumbs, search, etc.) */
    leftContent?: ReactNode;
    /** Additional class name */
    className?: string;
}

/**
 * Top bar/header component for all portals
 */
export function TopBar({
    title,
    userName,
    userRole,
    avatar,
    notificationCount = 0,
    onMenuClick,
    onNotificationClick,
    onProfileClick,
    showMenuButton = true,
    leftContent,
    className,
}: TopBarProps) {
    return (
        <header
            className={cn(
                'h-16',
                'bg-bg-secondary',
                'border-b border-white/10',
                'flex items-center justify-between',
                'px-4 md:px-6',
                className
            )}
        >
            {/* Left side */}
            <div className="flex items-center gap-4">
                {showMenuButton && onMenuClick && (
                    <IconButton
                        icon={<Menu className="w-5 h-5" />}
                        onClick={onMenuClick}
                        aria-label="Toggle menu"
                        className="lg:hidden"
                    />
                )}

                {leftContent || (
                    title && <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
                )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <IconButton
                        icon={<Bell className="w-5 h-5" />}
                        onClick={onNotificationClick}
                        aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
                    />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-error text-white text-xs font-medium rounded-full">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                </div>

                {/* User profile */}
                <button
                    onClick={onProfileClick}
                    className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-2 -mr-2 transition-colors"
                    aria-label="User profile"
                >
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium text-text-primary">
                            {userName || 'User'}
                        </p>
                        {userRole && (
                            <p className="text-xs text-text-muted capitalize">{userRole}</p>
                        )}
                    </div>

                    {avatar || (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    )}
                </button>
            </div>
        </header>
    );
}
