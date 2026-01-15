import { Users, GraduationCap, Building2, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react';

export function DashboardPage() {
    // Mock data - replace with real data from API
    const stats = [
        { label: 'Total Professors', value: '156', icon: Users, color: 'primary' },
        { label: 'Total Students', value: '3,842', icon: GraduationCap, color: 'teal' },
        { label: 'Active Classes', value: '48', icon: Building2, color: 'indigo' },
        { label: 'Timetables', value: '12', icon: CalendarDays, color: 'orange' },
    ];

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-secondary mt-1">
                    Welcome to College ERP Admin Portal
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-card p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-text-secondary text-sm">{stat.label}</p>
                                <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                            </div>
                            <div
                                className={`p-3 rounded-lg ${stat.color === 'primary'
                                        ? 'bg-primary/20'
                                        : stat.color === 'teal'
                                            ? 'bg-accent-teal/20'
                                            : stat.color === 'indigo'
                                                ? 'bg-secondary/20'
                                                : 'bg-accent-orange/20'
                                    }`}
                            >
                                <stat.icon
                                    className={`w-5 h-5 ${stat.color === 'primary'
                                            ? 'text-primary'
                                            : stat.color === 'teal'
                                                ? 'text-accent-teal'
                                                : stat.color === 'indigo'
                                                    ? 'text-secondary'
                                                    : 'text-accent-orange'
                                        }`}
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-success text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+12% from last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions and recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick actions */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="btn-secondary text-sm py-3">Add Professor</button>
                        <button className="btn-secondary text-sm py-3">Add Student</button>
                        <button className="btn-secondary text-sm py-3">Create Class</button>
                        <button className="btn-secondary text-sm py-3">Upload Timetable</button>
                    </div>
                </div>

                {/* Recent activity */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { action: 'New student registered', time: '5 min ago' },
                            { action: 'Timetable updated for CSE-A', time: '1 hour ago' },
                            { action: 'Professor John assigned to Physics', time: '2 hours ago' },
                            { action: 'Class 2024-ECE-B created', time: '3 hours ago' },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-text-primary flex-1">{item.action}</span>
                                <span className="text-text-muted">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="glass-card p-6 border-warning/30">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-text-primary">Pending Actions</h3>
                        <p className="text-text-secondary text-sm mt-1">
                            3 students need class assignment. 2 professors are pending verification.
                        </p>
                        <button className="text-primary text-sm font-medium mt-2 hover:underline">
                            View Details →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
