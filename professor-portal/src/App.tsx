import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                    <Route path="/marks" element={<ProtectedRoute><MarksPage /></ProtectedRoute>} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

// ============================================
// Protected Route Wrapper
// ============================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

// ============================================
// Page Components
// ============================================
function DashboardPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-bg-primary p-4 pb-20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-text-secondary text-sm">Welcome back</p>
                    <h1 className="text-xl font-bold text-text-primary">{user?.fullName || 'Professor'}</h1>
                </div>
                <button
                    onClick={handleSignOut}
                    className="p-2 text-text-secondary hover:text-error transition-colors"
                    title="Sign out"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>

            <h2 className="text-lg font-semibold text-text-primary mb-4">Today's Schedule</h2>
            <div className="space-y-3">
                {['Data Structures - CSE-A', 'Algorithms - CSE-B', 'Lab - IT-A'].map((cls, i) => (
                    <div key={i} className="glass-card p-4 border-l-4 border-l-primary">
                        <p className="font-medium text-text-primary">{cls}</p>
                        <p className="text-sm text-text-secondary">{9 + i}:00 - {10 + i}:00</p>
                    </div>
                ))}
            </div>
            <BottomNav />
        </div>
    );
}

function TimetablePage() {
    return (
        <div className="min-h-screen bg-bg-primary p-4 pb-20">
            <h1 className="text-2xl font-bold text-text-primary">Timetable</h1>
            <p className="text-text-secondary mt-2">Weekly schedule view coming soon</p>
            <BottomNav />
        </div>
    );
}

function AttendancePage() {
    return (
        <div className="min-h-screen bg-bg-primary p-4 pb-20">
            <h1 className="text-2xl font-bold text-text-primary">Attendance</h1>
            <p className="text-text-secondary mt-2">Mark attendance for your classes</p>
            <BottomNav />
        </div>
    );
}

function MarksPage() {
    return (
        <div className="min-h-screen bg-bg-primary p-4 pb-20">
            <h1 className="text-2xl font-bold text-text-primary">Marks</h1>
            <p className="text-text-secondary mt-2">Upload and manage student marks</p>
            <BottomNav />
        </div>
    );
}

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        { icon: '📅', label: 'Today', path: '/dashboard' },
        { icon: '📋', label: 'Timetable', path: '/timetable' },
        { icon: '✓', label: 'Attendance', path: '/attendance' },
        { icon: '📊', label: 'Marks', path: '/marks' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-secondary/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center">
            {items.map((item) => (
                <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-text-secondary'
                        }`}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                </button>
            ))}
        </nav>
    );
}

export default App;
