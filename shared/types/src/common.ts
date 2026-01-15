// ============================================
// Common Types & Utilities
// ============================================

/**
 * UUID type alias for clarity
 */
export type UUID = string;

/**
 * ISO Date string
 */
export type ISODateString = string;

/**
 * ISO DateTime string
 */
export type ISODateTimeString = string;

/**
 * Time string in HH:MM format
 */
export type TimeString = string;

/**
 * Base entity with common audit fields
 */
export interface BaseEntity {
    id: UUID;
    createdAt: ISODateTimeString;
    updatedAt?: ISODateTimeString;
    isDeleted: boolean;
    deletedAt?: ISODateTimeString;
    deletedBy?: UUID;
}

/**
 * Entity with audit trail
 */
export interface AuditableEntity extends BaseEntity {
    createdBy?: UUID;
    lastModifiedBy?: UUID;
    lastModifiedAt?: ISODateTimeString;
    version: number;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

/**
 * Generic API response
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    meta?: {
        timestamp: ISODateTimeString;
        requestId?: string;
    };
}

/**
 * Status colors for UI
 */
export type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Gender options
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Address type
 */
export interface Address {
    id: UUID;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    addressType: 'current' | 'permanent' | 'office' | 'correspondence';
    isVerified: boolean;
}

/**
 * Contact information
 */
export interface ContactInfo {
    email: string;
    phone?: string;
    alternatePhone?: string;
}

/**
 * Day of week
 */
export type DayOfWeek =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';

/**
 * Semester type
 */
export type SemesterType = 'odd' | 'even';
