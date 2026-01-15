// ============================================
// Validation Utilities
// ============================================

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (Indian)
 */
const PHONE_REGEX = /^(\+91|91)?[6-9]\d{9}$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return PHONE_REGEX.test(cleaned);
}

/**
 * Validate roll number format
 */
export function isValidRollNumber(rollNumber: string): boolean {
    // Basic validation - at least 5 characters, alphanumeric with allowed separators
    return /^[A-Za-z0-9/\-_]{5,20}$/.test(rollNumber);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    const isValid = errors.length === 0;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length <= 1 && password.length >= 10) {
        strength = 'strong';
    } else if (errors.length <= 2) {
        strength = 'medium';
    }

    return { isValid, errors, strength };
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
}

/**
 * Validate marks (0 to max)
 */
export function isValidMarks(marks: number, maxMarks: number): boolean {
    return marks >= 0 && marks <= maxMarks;
}

/**
 * Validate percentage (0 to 100)
 */
export function isValidPercentage(percentage: number): boolean {
    return percentage >= 0 && percentage <= 100;
}

/**
 * Sanitize input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate batch years
 */
export function isValidBatchYears(startYear: number, endYear: number): boolean {
    const currentYear = new Date().getFullYear();
    return (
        startYear >= 2000 &&
        startYear <= currentYear + 1 &&
        endYear > startYear &&
        endYear - startYear >= 2 &&
        endYear - startYear <= 6
    );
}

/**
 * Validate employee ID format
 */
export function isValidEmployeeId(employeeId: string): boolean {
    // Basic format: alphanumeric, 4-15 characters
    return /^[A-Za-z0-9]{4,15}$/.test(employeeId);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
