// ============================================
// Application Constants
// ============================================

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    ATTENDANCE_PAGE_SIZE: 10, // 10 students per page for attendance
    MAX_LIMIT: 100,
} as const;

/**
 * Attendance thresholds
 */
export const ATTENDANCE_THRESHOLDS = {
    GOOD: 75,
    WARNING: 60,
    CRITICAL: 50,
    MINIMUM_REQUIRED: 75,
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    ADMIN_BASE: '/api/admin/v1',
    ACADEMIC_BASE: '/api/academic/v1',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'college-erp-access-token',
    REFRESH_TOKEN: 'college-erp-refresh-token',
    USER_DATA: 'college-erp-user-data',
    THEME: 'college-erp-theme',
    SIDEBAR_COLLAPSED: 'college-erp-sidebar-collapsed',
} as const;

/**
 * Route paths
 */
export const ROUTES = {
    // Auth routes
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',

    // Admin portal routes
    ADMIN: {
        DASHBOARD: '/dashboard',
        PROFESSORS: '/professors',
        STUDENTS: '/students',
        BATCHES: '/batches',
        COURSES: '/courses',
        BRANCHES: '/branches',
        CLASSES: '/classes',
        TIMETABLES: '/timetables',
        SETTINGS: '/settings',
    },

    // Professor portal routes
    PROFESSOR: {
        DASHBOARD: '/dashboard',
        TIMETABLE: '/timetable',
        ATTENDANCE: '/attendance',
        MARKS: '/marks',
        CLASSES: '/classes',
        GROUPS: '/groups',
        PROFILE: '/profile',
    },

    // Student portal routes
    STUDENT: {
        DASHBOARD: '/dashboard',
        TIMETABLE: '/timetable',
        ATTENDANCE: '/attendance',
        MARKS: '/marks',
        GROUPS: '/groups',
        FEES: '/fees',
        PROFILE: '/profile',
    },
} as const;

/**
 * Role-based accent colors (as per design system)
 */
export const ROLE_COLORS = {
    admin: '#6366F1', // Indigo
    professor: '#0066FF', // Blue
    student: '#14B8A6', // Teal
} as const;

/**
 * Status colors
 */
export const STATUS_COLORS = {
    success: '#10B981',
    warning: '#F97316',
    error: '#EF4444',
    info: '#3B82F6',
    neutral: '#94A3B8',
} as const;

/**
 * Token expiry times (in seconds)
 */
export const TOKEN_EXPIRY = {
    ACCESS_TOKEN: 15 * 60, // 15 minutes
    REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
} as const;

/**
 * File upload limits
 */
export const UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

/**
 * Debounce delays (in ms)
 */
export const DEBOUNCE = {
    SEARCH: 300,
    RESIZE: 150,
    SCROLL: 100,
} as const;

/**
 * Animation durations (in ms)
 */
export const ANIMATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
} as const;

/**
 * Breakpoints (matching Tailwind CSS)
 */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
} as const;

/**
 * Days of the week (for timetable)
 */
export const WEEKDAYS = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
] as const;

/**
 * Semester options
 */
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
