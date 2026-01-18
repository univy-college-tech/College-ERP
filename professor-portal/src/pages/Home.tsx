// ============================================
// Professor Portal - Home Page
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header, PageContainer, Card, Badge, LoadingSpinner, EmptyState, Button } from '../components/Layout';

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
    class_label: string;
    class_id: string;
    class_subject_id: string;
    batch_name: string;
    branch_code: string;
    total_classes_conducted: number;
    student_count: number;
    cr: {
        id: string;
        name: string;
        phone: string;
        email: string;
        roll_number: string;
    } | null;
}

interface TodaySchedule {
    day_of_week: number;
    date: string;
    classes: TodayClass[];
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
    // Start from 8 AM (8 * 60 = 480 minutes)
    const baseMinutes = 8 * 60;
    const currentMinutes = hours * 60 + minutes;
    // Each hour = 80px
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
    // Each hour = 80px
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

// ============================================
// Class Card Component (Mobile)
// ============================================
interface ClassCardProps {
    cls: TodayClass;
    onTakeAttendance: () => void;
    onContactCR: () => void;
}

function ClassCard({ cls, onTakeAttendance, onContactCR }: ClassCardProps) {
    const isCurrent = isCurrentClass(cls.start_time, cls.end_time);
    const upcoming = isUpcoming(cls.start_time);

    return (
        <Card
            className={`border-l-4 ${isCurrent
                ? 'border-l-success bg-success/5'
                : upcoming
                    ? 'border-l-primary'
                    : 'border-l-text-muted'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Time */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-primary">
                            {formatTimeRange(cls.start_time, cls.end_time)}
                        </span>
                        {isCurrent && <Badge variant="success">Now</Badge>}
                        {upcoming && !isCurrent && <Badge variant="info">Upcoming</Badge>}
                    </div>

                    {/* Subject */}
                    <h3 className="text-base font-bold text-text-primary truncate">
                        {cls.subject_name}
                    </h3>

                    {/* Class & Room */}
                    <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {cls.class_label}
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

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        <span>{cls.student_count} students</span>
                        <span>•</span>
                        <span>{cls.total_classes_conducted} classes done</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    {cls.cr && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onContactCR(); }}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title={`Contact CR: ${cls.cr.name}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Take Attendance Button */}
            <button
                onClick={onTakeAttendance}
                className="w-full mt-3 py-2 px-4 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Take Attendance
            </button>
        </Card>
    );
}

// ============================================
// Timeline View Component (Mobile)
// ============================================
function TimelineView({ classes, onTakeAttendance, onContactCR }: {
    classes: TodayClass[];
    onTakeAttendance: (cls: TodayClass) => void;
    onContactCR: (cls: TodayClass) => void;
}) {
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
                                ? 'bg-primary/20 border border-primary/30'
                                : 'bg-bg-secondary border border-white/10'
                                }`}
                            style={{ top, minHeight: Math.max(height - 8, 60) }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-primary font-medium">
                                        {formatTimeRange(cls.start_time, cls.end_time)}
                                    </p>
                                    <h4 className="font-semibold text-text-primary truncate">
                                        {cls.subject_name}
                                    </h4>
                                    <p className="text-xs text-text-secondary">
                                        {cls.class_label} {cls.room_number && `• Room ${cls.room_number}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {cls.cr && (
                                        <button
                                            onClick={() => onContactCR(cls)}
                                            className="p-1.5 rounded-md bg-white/5 text-text-secondary hover:text-primary"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onTakeAttendance(cls)}
                                        className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </button>
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
// CR Contact Modal
// ============================================
interface CRModalProps {
    cr: TodayClass['cr'];
    className: string;
    onClose: () => void;
}

function CRContactModal({ cr, className, onClose }: CRModalProps) {
    if (!cr) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-bg-secondary rounded-t-2xl sm:rounded-2xl w-full max-w-sm mx-4 p-6 animate-slide-up">
                <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-primary">
                            {cr.name?.split(' ').map(n => n[0]).join('') || 'CR'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{cr.name}</h3>
                    <p className="text-sm text-text-secondary">Class Representative • {className}</p>
                    <p className="text-xs text-text-muted mt-1">{cr.roll_number}</p>
                </div>

                <div className="space-y-3">
                    {cr.phone && (
                        <a
                            href={`tel:${cr.phone}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Call</p>
                                <p className="text-xs text-text-secondary">{cr.phone}</p>
                            </div>
                        </a>
                    )}

                    {cr.email && (
                        <a
                            href={`mailto:${cr.email}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Email</p>
                                <p className="text-xs text-text-secondary truncate max-w-[200px]">{cr.email}</p>
                            </div>
                        </a>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-4 py-3 text-text-secondary hover:text-text-primary transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// ============================================
// Main Home Component
// ============================================
export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [schedule, setSchedule] = useState<TodaySchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
    const [selectedCR, setSelectedCR] = useState<{ cr: TodayClass['cr']; className: string } | null>(null);

    // Fetch today's schedule
    useEffect(() => {
        fetchTodaySchedule();
    }, [user]);

    const fetchTodaySchedule = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE}/timetable/today?user_id=${user.id}&role=professor`
            );
            const data = await response.json();

            if (data.success) {
                setSchedule(data.data);
            } else {
                setError(data.message || 'Failed to fetch schedule');
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError('Failed to load schedule. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTakeAttendance = (cls: TodayClass) => {
        navigate(`/attendance/take/${cls.class_subject_id}`, {
            state: {
                classSubject: cls,
                date: schedule?.date
            }
        });
    };

    const handleContactCR = (cls: TodayClass) => {
        if (cls.cr) {
            setSelectedCR({ cr: cls.cr, className: cls.class_label });
        }
    };

    return (
        <PageContainer
            header={<Header showDate showNotification />}
        >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Card className="text-center">
                    <p className="text-2xl font-bold text-primary">
                        {schedule?.classes.length || 0}
                    </p>
                    <p className="text-xs text-text-secondary">Classes Today</p>
                </Card>
                <Card className="text-center">
                    <p className="text-2xl font-bold text-success">
                        {schedule?.classes.reduce((sum, c) => sum + c.student_count, 0) || 0}
                    </p>
                    <p className="text-xs text-text-secondary">Total Students</p>
                </Card>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">Today's Schedule</h2>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-secondary">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'list'
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'timeline'
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Timeline
                    </button>
                </div>
            </div>

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
                        <Button onClick={fetchTodaySchedule} variant="secondary">
                            Try Again
                        </Button>
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

            {/* Classes */}
            {!loading && !error && schedule && schedule.classes.length > 0 && (
                viewMode === 'list' ? (
                    <div className="space-y-3">
                        {schedule.classes.map((cls) => (
                            <ClassCard
                                key={cls.id}
                                cls={cls}
                                onTakeAttendance={() => handleTakeAttendance(cls)}
                                onContactCR={() => handleContactCR(cls)}
                            />
                        ))}
                    </div>
                ) : (
                    <TimelineView
                        classes={schedule.classes}
                        onTakeAttendance={handleTakeAttendance}
                        onContactCR={handleContactCR}
                    />
                )
            )}

            {/* CR Contact Modal */}
            {selectedCR && (
                <CRContactModal
                    cr={selectedCR.cr}
                    className={selectedCR.className}
                    onClose={() => setSelectedCR(null)}
                />
            )}
        </PageContainer>
    );
}
