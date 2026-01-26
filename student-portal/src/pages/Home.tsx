// ============================================
// Student Portal - Home Page
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header, PageContainer, Card, Badge, LoadingSpinner, EmptyState, BottomNav } from '../components/Layout';

// ============================================
// Types
// ============================================
interface TodayClass {
    id: string;
    start_time: string;
    end_time: string;
    room_number: string;
    slot_type: string;
    subject_name: string;
    subject_code: string;
    professor_name: string;
    class_subject_id: string;
}

interface TodaySchedule {
    day_of_week: number;
    date: string;
    classes: TodayClass[];
}

interface AttendanceOverall {
    total_classes: number;
    attended: number;
    percentage: number;
    status: 'good' | 'warning' | 'danger';
}

interface WeeklyTimetable {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room_number: string;
    slot_type: string;
    subject_name: string;
    subject_code: string;
    professor_name: string;
    class_subject_id: string;
}

// ============================================
// API Configuration
// ============================================
const API_BASE = import.meta.env.VITE_ACADEMIC_API_URL || 'http://localhost:4002/api/academic/v1';

// ============================================
// Time Utility Functions
// ============================================
function formatTime(time: string): string {
    const parts = time.split(':');
    const hours = parts[0] || '0';
    const minutes = parts[1] || '00';
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function formatTimeRange(start: string, end: string): string {
    return `${formatTime(start)} - ${formatTime(end)}`;
}

function getTimePosition(time: string): number {
    const parts = time.split(':').map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const baseMinutes = 8 * 60;
    const currentMinutes = hours * 60 + minutes;
    return ((currentMinutes - baseMinutes) / 60) * 80;
}

function getSlotHeight(start: string, end: string): number {
    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);
    const startH = startParts[0] ?? 0;
    const startM = startParts[1] ?? 0;
    const endH = endParts[0] ?? 0;
    const endM = endParts[1] ?? 0;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return ((endMinutes - startMinutes) / 60) * 80;
}

function isCurrentClass(start: string, end: string): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);
    const startH = startParts[0] ?? 0;
    const startM = startParts[1] ?? 0;
    const endH = endParts[0] ?? 0;
    const endM = endParts[1] ?? 0;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function isUpcoming(start: string): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startParts = start.split(':').map(Number);
    const startH = startParts[0] ?? 0;
    const startM = startParts[1] ?? 0;
    const startMinutes = startH * 60 + startM;
    return startMinutes > currentMinutes;
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ============================================
// Class Card Component (Mobile)
// ============================================
interface ClassCardProps {
    cls: TodayClass;
}

function ClassCard({ cls }: ClassCardProps) {
    const isCurrent = isCurrentClass(cls.start_time, cls.end_time);
    const upcoming = isUpcoming(cls.start_time);

    return (
        <Card
            className={`border-l-4 ${isCurrent
                ? 'border-l-success bg-success/5'
                : upcoming
                    ? 'border-l-accent-teal'
                    : 'border-l-text-muted'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Time */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-accent-teal">
                            {formatTimeRange(cls.start_time, cls.end_time)}
                        </span>
                        {isCurrent && <Badge variant="success">Now</Badge>}
                        {upcoming && !isCurrent && <Badge variant="info">Upcoming</Badge>}
                    </div>

                    {/* Subject */}
                    <h3 className="text-base font-bold text-text-primary truncate">
                        {cls.subject_name}
                    </h3>

                    {/* Professor & Room */}
                    <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {cls.professor_name || 'TBA'}
                        </span>
                        {cls.room_number && (
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Room {cls.room_number}
                            </span>
                        )}
                    </div>

                    {/* Subject Code */}
                    <p className="text-xs text-text-muted mt-1">{cls.subject_code}</p>
                </div>

                {/* Slot type indicator */}
                <div className="flex flex-col items-end gap-2">
                    {cls.slot_type && (
                        <Badge variant={cls.slot_type === 'lecture' ? 'default' : 'info'}>
                            {cls.slot_type}
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}

// ============================================
// Timeline View Component (Mobile)
// ============================================
function TimelineView({ classes }: { classes: TodayClass[] }) {
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <div className="relative">
            {/* Time labels */}
            <div className="absolute left-0 top-0 w-14 flex flex-col">
                {timeSlots.map((time) => (
                    <div
                        key={time}
                        className="h-20 text-xs text-text-muted flex items-start justify-end pr-2 pt-0.5"
                    >
                        {formatTime(time)}
                    </div>
                ))}
            </div>

            {/* Timeline line */}
            <div className="ml-16 relative" style={{ height: timeSlots.length * 80 }}>
                {/* Vertical line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />

                {/* Hour markers */}
                {timeSlots.map((_, i) => (
                    <div
                        key={i}
                        className="absolute left-0 w-2 h-px bg-white/20"
                        style={{ top: i * 80 }}
                    />
                ))}

                {/* Current time indicator */}
                {(() => {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    const baseMinutes = 8 * 60;
                    if (currentMinutes >= baseMinutes && currentMinutes <= 17 * 60) {
                        const position = ((currentMinutes - baseMinutes) / 60) * 80;
                        return (
                            <div
                                className="absolute right-0 flex items-center gap-1 z-10"
                                style={{ top: position, left: -8 }}
                            >
                                <div className="w-4 h-4 rounded-full bg-error animate-pulse" />
                                <div className="flex-1 h-0.5 bg-error/50" />
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Class cards positioned on timeline */}
                {classes.map((cls) => {
                    const top = getTimePosition(cls.start_time);
                    const height = getSlotHeight(cls.start_time, cls.end_time);
                    const isCurrent = isCurrentClass(cls.start_time, cls.end_time);

                    return (
                        <div
                            key={cls.id}
                            className={`absolute left-4 right-0 rounded-lg p-3 ${isCurrent
                                ? 'bg-accent-teal/20 border border-accent-teal/30'
                                : 'bg-bg-secondary border border-white/10'
                                }`}
                            style={{ top, minHeight: Math.max(height - 8, 60) }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-accent-teal font-medium">
                                        {formatTimeRange(cls.start_time, cls.end_time)}
                                    </p>
                                    <h4 className="font-semibold text-text-primary truncate">
                                        {cls.subject_name}
                                    </h4>
                                    <p className="text-xs text-text-secondary">
                                        {cls.professor_name || 'TBA'} {cls.room_number && `• Room ${cls.room_number}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// Weekly Grid View (Desktop)
// ============================================
function WeeklyGridView({ timetable }: { timetable: WeeklyTimetable[] }) {
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const days = [1, 2, 3, 4, 5, 6]; // Mon-Sat
    const today = new Date().getDay() === 0 ? 7 : new Date().getDay();

    // Group timetable by day
    const timetableByDay = days.map(day => ({
        day,
        classes: timetable.filter(slot => slot.day_of_week === day)
    }));

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    <div className="text-xs font-medium text-text-muted text-center"></div>
                    {days.map(day => (
                        <div
                            key={day}
                            className={`text-center py-2 rounded-lg ${day === today
                                ? 'bg-accent-teal text-white font-bold'
                                : 'text-text-secondary'
                                }`}
                        >
                            {DAY_NAMES[day]}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="relative" style={{ height: timeSlots.length * 60 }}>
                    {/* Time slots background */}
                    {timeSlots.map((time, i) => (
                        <div
                            key={time}
                            className="absolute left-0 right-0 border-t border-white/5 grid grid-cols-7 gap-2"
                            style={{ top: i * 60, height: 60 }}
                        >
                            <div className="text-xs text-text-muted pt-1 text-right pr-2">
                                {formatTime(time)}
                            </div>
                            {days.map(day => (
                                <div key={day} className="border-l border-white/5" />
                            ))}
                        </div>
                    ))}

                    {/* Classes overlay */}
                    {timetableByDay.map(({ day, classes: dayClasses }) => (
                        <div
                            key={day}
                            className="absolute"
                            style={{
                                left: `${(day) * (100 / 7)}%`,
                                width: `${100 / 7}%`,
                                top: 0,
                                bottom: 0,
                                paddingLeft: '4px',
                                paddingRight: '4px',
                            }}
                        >
                            {dayClasses.map(cls => {
                                const top = getTimePosition(cls.start_time) * 0.75;
                                const height = getSlotHeight(cls.start_time, cls.end_time) * 0.75;
                                const isCurrent = day === today && isCurrentClass(cls.start_time, cls.end_time);

                                return (
                                    <div
                                        key={cls.id}
                                        className={`absolute left-1 right-1 rounded-md p-2 overflow-hidden ${isCurrent
                                            ? 'bg-accent-teal/30 border border-accent-teal'
                                            : 'bg-bg-secondary/80 border border-white/10'
                                            }`}
                                        style={{ top, height: Math.max(height - 4, 40) }}
                                    >
                                        <p className="text-xs font-semibold text-text-primary truncate">
                                            {cls.subject_name}
                                        </p>
                                        <p className="text-xs text-text-muted truncate">
                                            {cls.room_number && `R${cls.room_number}`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// Attendance Overview Widget
// ============================================
function AttendanceWidget({ overall, onViewDetails }: { overall: AttendanceOverall | null; onViewDetails: () => void }) {
    if (!overall) return null;

    const statusColors = {
        good: 'text-success border-success',
        warning: 'text-warning border-warning',
        danger: 'text-error border-error',
    };

    return (
        <Card className="cursor-pointer hover:border-accent-teal/50" onClick={onViewDetails}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Overall Attendance</h3>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${statusColors[overall.status].split(' ')[0]}`}>
                            {overall.percentage}%
                        </span>
                        <span className="text-xs text-text-muted">
                            ({overall.attended}/{overall.total_classes} classes)
                        </span>
                    </div>
                </div>
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center ${statusColors[overall.status]}`}>
                    <span className={`text-sm font-bold ${statusColors[overall.status].split(' ')[0]}`}>
                        {overall.percentage}%
                    </span>
                </div>
            </div>
        </Card>
    );
}

// ============================================
// Main Home Component
// ============================================
export default function Home() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [schedule, setSchedule] = useState<TodaySchedule | null>(null);
    const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable[]>([]);
    const [attendanceOverall, setAttendanceOverall] = useState<AttendanceOverall | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
    const [isDesktop, setIsDesktop] = useState(false);

    // Check if desktop
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Fetch data
    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch today's schedule
            const scheduleRes = await fetch(
                `${API_BASE}/timetable/today?user_id=${user.id}&role=student`
            );
            const scheduleData = await scheduleRes.json();
            if (scheduleData.success) {
                setSchedule(scheduleData.data);
            }

            // Fetch weekly timetable for desktop
            const weeklyRes = await fetch(
                `${API_BASE}/timetable/my?user_id=${user.id}&role=student`
            );
            const weeklyData = await weeklyRes.json();
            if (weeklyData.success) {
                setWeeklyTimetable(weeklyData.data);
            }

            // Fetch attendance overview
            const attendanceRes = await fetch(
                `${API_BASE}/attendance/my?user_id=${user.id}`
            );
            const attendanceData = await attendanceRes.json();
            if (attendanceData.success) {
                setAttendanceOverall(attendanceData.data.overall);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <PageContainer
            header={
                <div className="flex items-center justify-between py-4">
                    <div>
                        <p className="text-sm text-text-secondary">{getGreeting()}</p>
                        <h1 className="text-xl font-bold text-text-primary">{user?.fullName || 'Student'}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-accent-teal/20 flex items-center justify-center">
                            <span className="text-accent-teal font-semibold">
                                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'ST'}
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 text-text-secondary hover:text-error transition-colors"
                            title="Sign out"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            }
        >
            {/* Attendance Overview */}
            <div className="mb-6">
                <AttendanceWidget
                    overall={attendanceOverall}
                    onViewDetails={() => navigate('/attendance')}
                />
            </div>

            {/* View Toggle (Mobile) */}
            {!isDesktop && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-text-primary">Today's Schedule</h2>
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-secondary">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'list'
                                ? 'bg-accent-teal text-white'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'timeline'
                                ? 'bg-accent-teal text-white'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            Timeline
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop: Weekly Grid */}
            {isDesktop && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Weekly Timetable</h2>
                    <Card className="p-4">
                        <WeeklyGridView timetable={weeklyTimetable} />
                    </Card>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <EmptyState
                    icon={
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    }
                    title="Unable to load schedule"
                    description={error}
                    action={
                        <button onClick={fetchData} className="btn-secondary">
                            Try Again
                        </button>
                    }
                />
            )}

            {/* Empty State */}
            {!loading && !error && schedule?.classes.length === 0 && (
                <EmptyState
                    icon={
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    title="No classes today"
                    description="Enjoy your day off! Check back on your next working day."
                />
            )}

            {/* Mobile: Classes */}
            {!isDesktop && !loading && !error && schedule && schedule.classes.length > 0 && (
                viewMode === 'list' ? (
                    <div className="space-y-3">
                        {schedule.classes.map((cls) => (
                            <ClassCard key={cls.id} cls={cls} />
                        ))}
                    </div>
                ) : (
                    <TimelineView classes={schedule.classes} />
                )
            )}

            <BottomNav />
        </PageContainer>
    );
}
