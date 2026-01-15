import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gradient">404</h1>
                <p className="text-xl text-text-secondary mt-4">Page not found</p>
                <Link to="/" className="btn-primary inline-flex items-center gap-2 mt-6">
                    <Home className="w-4 h-4" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
