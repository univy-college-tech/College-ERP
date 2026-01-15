// ============================================
// Formatting Utilities
// ============================================

import type { AttendanceStatus, StatusColor } from '@college-erp/types';

/**
 * Format name to display format (Title Case)
 */
export function formatName(name: string): string {
    return name
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get initials from full name
 */
export function getInitials(name: string, maxLength = 2): string {
    return name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, maxLength);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Indian format: +91 99999 99999
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }

    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimalPlaces = 1): string {
    return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Get attendance status color
 */
export function getAttendanceStatusColor(status: AttendanceStatus): StatusColor {
    const colorMap: Record<AttendanceStatus, StatusColor> = {
        present: 'success',
        absent: 'error',
        late: 'warning',
        excused: 'info',
    };
    return colorMap[status];
}

/**
 * Get attendance percentage status
 */
export function getAttendanceStatus(percentage: number): {
    status: 'good' | 'warning' | 'critical';
    color: StatusColor;
    message: string;
} {
    if (percentage >= 75) {
        return {
            status: 'good',
            color: 'success',
            message: 'Good standing',
        };
    }
    if (percentage >= 60) {
        return {
            status: 'warning',
            color: 'warning',
            message: 'Attendance low',
        };
    }
    return {
        status: 'critical',
        color: 'error',
        message: 'Critically low attendance',
    };
}

/**
 * Format roll number for display
 */
export function formatRollNumber(rollNumber: string): string {
    // If it's already formatted, return as is
    if (rollNumber.includes('/') || rollNumber.includes('-')) {
        return rollNumber.toUpperCase();
    }
    return rollNumber.toUpperCase();
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    const pluralForm = plural || `${singular}s`;
    return count === 1 ? singular : pluralForm;
}

/**
 * Format count with text
 */
export function formatCount(count: number, singular: string, plural?: string): string {
    return `${count} ${pluralize(count, singular, plural)}`;
}

/**
 * Get ordinal suffix for a number
 */
export function getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    const suffix = s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th';
    return n + suffix;
}

/**
 * Format semester number
 */
export function formatSemester(semesterNumber: number): string {
    return `${getOrdinalSuffix(semesterNumber)} Semester`;
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Generate class label
 */
export function generateClassLabel(
    batchStart: number,
    branchCode: string,
    sectionName: string
): string {
    return `${batchStart}-${branchCode}-${sectionName}`.toUpperCase();
}
