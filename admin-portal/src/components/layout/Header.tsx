import { Bell, Search, Menu, User } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-bg-secondary border-b border-white/10 flex items-center justify-between px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-md hover:bg-white/5 text-text-secondary transition-colors lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search professors, students, classes..."
                        className="input pl-10 w-64 lg:w-96"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-md hover:bg-white/5 text-text-secondary transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
                </button>

                {/* User menu */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium text-text-primary">
                            {user?.fullName || 'Admin User'}
                        </p>
                        <p className="text-xs text-text-muted capitalize">{user?.role || 'admin'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-admin/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-admin" />
                    </div>
                </div>
            </div>
        </header>
    );
}
