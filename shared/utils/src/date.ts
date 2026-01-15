// ============================================
// Date Utilities
// ============================================

import {
    format,
    parseISO,
    startOfWeek,
    endOfWeek,
    addDays,
    isToday,
    isSameDay,
    differenceInDays,
    getDay,
} from 'date-fns';

import type { DayOfWeek } from '@college-erp/types';

/**
 * Day of week mapping
 */
const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
    0: 'monday', // Sunday remapped to Monday for week start
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};

const DAY_INDEX_MAP: Record<DayOfWeek, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

/**
 * Format date to display format
 */
export function formatDate(date: string | Date, formatStr = 'dd MMM yyyy'): string {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr);
}

/**
 * Format date for API requests (ISO format)
 */
export function formatDateForApi(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

/**
 * Format time to 12-hour format
 */
export function formatTime(time: string): string {
    const parts = time.split(':').map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Get current day of week
 */
export function getCurrentDayOfWeek(): DayOfWeek {
    const dayIndex = getDay(new Date());
    return DAY_OF_WEEK_MAP[dayIndex] || 'monday';
}

/**
 * Get day index from day of week
 */
export function getDayIndex(day: DayOfWeek): number {
    return DAY_INDEX_MAP[day];
}

/**
 * Get week start and end dates
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return { start, end };
}

/**
 * Get all weekdays in a week
 */
export function getWeekDays(weekStart: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 6; i++) {
        // Monday to Saturday
        days.push(addDays(weekStart, i));
    }
    return days;
}

/**
 * Check if date is today
 */
export function checkIsToday(date: string | Date): boolean {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isToday(parsedDate);
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: string | Date, date2: string | Date): boolean {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isSameDay(d1, d2);
}

/**
 * Get relative date text
 */
export function getRelativeDate(date: string | Date): string {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    const diffDays = differenceInDays(today, parsedDate);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays < -1 && diffDays >= -7) return `In ${Math.abs(diffDays)} days`;

    return formatDate(parsedDate);
}

/**
 * Get academic year label from year numbers
 */
export function getAcademicYearLabel(startYear: number, endYear?: number): string {
    if (endYear) {
        return `${startYear}-${endYear}`;
    }
    return `${startYear}-${startYear + 1}`;
}

/**
 * Get current academic year
 */
export function getCurrentAcademicYear(): { label: string; startYear: number; endYear: number } {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    // Academic year starts in July (month 6)
    const startYear = month >= 6 ? year : year - 1;
    const endYear = startYear + 1;

    return {
        label: `${startYear}-${endYear}`,
        startYear,
        endYear,
    };
}
