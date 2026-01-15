// ============================================
// Authentication & Authorization Types
// ============================================

import type { UUID, ISODateTimeString } from './common';

/**
 * User roles in the system
 */
export type UserRole =
    | 'admin'
    | 'professor'
    | 'student'
    | 'dean'
    | 'student_cell'
    | 'staff';

/**
 * Admin levels for admin users
 */
export type AdminLevel = 'super_admin' | 'academic_admin' | 'staff';

/**
 * Office types for officials
 */
export type OfficeType =
    | 'dean'
    | 'student_cell'
    | 'exam_cell'
    | 'training_cell'
    | 'placement_cell';

/**
 * JWT payload structure
 */
export interface JWTPayload {
    sub: UUID;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
}

/**
 * Login request
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
}

/**
 * Authenticated user info
 */
export interface AuthUser {
    id: UUID;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    profileId?: UUID;
    profileType?: 'student' | 'professor' | 'admin' | 'official';
    lastLoginAt?: ISODateTimeString;
}

/**
 * Session data stored in context/state
 */
export interface Session {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresAt: ISODateTimeString;
    isAuthenticated: boolean;
}

/**
 * Password change request
 */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * Permission check result
 */
export interface PermissionResult {
    allowed: boolean;
    reason?: string;
}

/**
 * Role permissions mapping
 */
export type RolePermissions = Record<UserRole, string[]>;
