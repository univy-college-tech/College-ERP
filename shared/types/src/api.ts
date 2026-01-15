// ============================================
// API Contract Types
// ============================================

import type { UUID, PaginationParams } from './common';

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API Error codes
 */
export enum ApiErrorCode {
    // Authentication errors
    UNAUTHORIZED = 'UNAUTHORIZED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

    // Validation errors
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

    // Resource errors
    NOT_FOUND = 'NOT_FOUND',
    ALREADY_EXISTS = 'ALREADY_EXISTS',
    CONFLICT = 'CONFLICT',

    // Business logic errors
    OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
    LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
    INVALID_STATE = 'INVALID_STATE',

    // Server errors
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
    DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * API Error response
 */
export interface ApiError {
    code: ApiErrorCode | string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string; // Only in development
}

/**
 * Validation error details
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

/**
 * Base query parameters
 */
export interface BaseQueryParams extends Partial<PaginationParams> {
    search?: string;
    filter?: Record<string, string | number | boolean>;
}

/**
 * Admin API - Professor endpoints
 */
export interface CreateProfessorRequest {
    email: string;
    fullName: string;
    phone?: string;
    employeeId: string;
    departmentId: UUID;
    designation: string;
    qualification?: string;
    specialization?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    joiningDate: string;
    employmentType: 'permanent' | 'contract' | 'visiting' | 'adjunct';
}

export interface UpdateProfessorRequest {
    fullName?: string;
    phone?: string;
    departmentId?: UUID;
    designation?: string;
    qualification?: string;
    specialization?: string;
    employmentType?: 'permanent' | 'contract' | 'visiting' | 'adjunct';
    isActive?: boolean;
}

/**
 * Admin API - Student endpoints
 */
export interface CreateStudentRequest {
    email: string;
    fullName: string;
    phone?: string;
    rollNumber: string;
    registrationNumber?: string;
    admissionNumber?: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    category?: 'general' | 'obc' | 'sc' | 'st' | 'ews';
    admissionYear: number;
    admissionType: 'regular' | 'lateral_entry' | 'management';
    currentSemester?: number;
}

export interface UpdateStudentRequest {
    fullName?: string;
    phone?: string;
    category?: 'general' | 'obc' | 'sc' | 'st' | 'ews';
    currentSemester?: number;
    status?: 'active' | 'dropped' | 'graduated' | 'suspended' | 'transferred';
    isActive?: boolean;
}

/**
 * Admin API - Academic structure endpoints
 */
export interface CreateBatchRequest {
    batchName: string;
    startYear: number;
    endYear: number;
}

export interface CreateCourseRequest {
    courseName: string;
    courseCode: string;
    durationYears: number;
}

export interface CreateBranchRequest {
    courseId: UUID;
    departmentId?: UUID;
    branchName: string;
    branchCode: string;
}

export interface CreateSectionRequest {
    branchId: UUID;
    sectionName: string;
}

export interface CreateClassRequest {
    batchId: UUID;
    courseId: UUID;
    branchId: UUID;
    sectionId: UUID;
    academicYearId: UUID;
    currentSemesterId?: UUID;
    classLabel: string;
    classInchargeId?: UUID;
}

/**
 * Admin API - Assignment endpoints
 */
export interface AssignStudentsToClassRequest {
    classId: UUID;
    studentIds: UUID[];
}

export interface AssignCRRequest {
    classId: UUID;
    studentId: UUID;
}

export interface AssignSubjectToClassRequest {
    classId: UUID;
    subjectId: UUID;
    professorId: UUID;
    semesterId: UUID;
    totalClassesPlanned?: number;
}

/**
 * Academic API - Query filters
 */
export interface AttendanceQueryParams extends BaseQueryParams {
    classSubjectId?: UUID;
    fromDate?: string;
    toDate?: string;
    studentId?: UUID;
}

export interface MarksQueryParams extends BaseQueryParams {
    classSubjectId?: UUID;
    componentType?: string;
    studentId?: UUID;
}

export interface TimetableQueryParams {
    classId?: UUID;
    semesterId?: UUID;
    date?: string;
    weekStart?: string;
}
