// ============================================
// User Profile Types
// ============================================

import type { UUID, ISODateString, AuditableEntity, Gender, Address, ContactInfo } from './common';
import type { UserRole, AdminLevel, OfficeType } from './auth';

/**
 * Base user entity
 */
export interface User extends AuditableEntity {
    email: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
}

/**
 * Student status
 */
export type StudentStatus =
    | 'active'
    | 'dropped'
    | 'graduated'
    | 'suspended'
    | 'transferred';

/**
 * Admission type
 */
export type AdmissionType = 'regular' | 'lateral_entry' | 'management';

/**
 * Category for reservation
 */
export type Category = 'general' | 'obc' | 'sc' | 'st' | 'ews';

/**
 * Student profile
 */
export interface StudentProfile {
    id: UUID;
    userId: UUID;
    rollNumber: string;
    registrationNumber?: string;
    admissionNumber?: string;
    dateOfBirth: ISODateString;
    gender: Gender;
    bloodGroup?: string;
    category?: Category;
    religion?: string;
    nationality: string;
    motherTongue?: string;
    currentSemester: number;
    admissionYear: number;
    admissionType: AdmissionType;
    previousEducation?: PreviousEducation[];
    status: StudentStatus;
    isActive: boolean;
    createdAt: string;
}

/**
 * Previous education record
 */
export interface PreviousEducation {
    level: 'tenth' | 'twelfth' | 'diploma' | 'graduation';
    board?: string;
    institution: string;
    yearOfPassing: number;
    percentage?: number;
    cgpa?: number;
}

/**
 * Employment type for professors
 */
export type EmploymentType = 'permanent' | 'contract' | 'visiting' | 'adjunct';

/**
 * Professor profile
 */
export interface ProfessorProfile {
    id: UUID;
    userId: UUID;
    employeeId: string;
    departmentId: UUID;
    designation: string;
    qualification?: string;
    specialization?: string;
    dateOfBirth?: ISODateString;
    gender?: Gender;
    joiningDate: ISODateString;
    employmentType: EmploymentType;
    salaryGrade?: string;
    bankAccount?: string;
    panNumber?: string;
    reportingTo?: UUID;
    isActive: boolean;
    createdAt: string;
}

/**
 * Admin profile
 */
export interface AdminProfile {
    id: UUID;
    userId: UUID;
    adminLevel: AdminLevel;
    permissions?: Record<string, boolean>;
    createdAt: string;
}

/**
 * Official profile (Dean, Student Cell, etc.)
 */
export interface OfficialProfile {
    id: UUID;
    userId: UUID;
    officeType: OfficeType;
    officeName: string;
    authorityLevel: number;
    createdAt: string;
}

/**
 * Guardian information for students
 */
export interface Guardian {
    id: UUID;
    studentId: UUID;
    guardianType: 'father' | 'mother' | 'legal_guardian';
    fullName: string;
    phone: string;
    email?: string;
    occupation?: string;
    annualIncome?: number;
    address?: Address;
    isPrimary: boolean;
}

/**
 * Emergency contact
 */
export interface EmergencyContact {
    id: UUID;
    userId: UUID;
    contactName: string;
    relationship: string;
    phonePrimary: string;
    phoneSecondary?: string;
    email?: string;
    address?: Address;
    isPrimary: boolean;
}

/**
 * Document types
 */
export type DocumentType =
    | 'aadhar'
    | 'pan'
    | 'passport'
    | 'driving_license'
    | 'birth_certificate'
    | 'tenth_marksheet'
    | 'twelfth_marksheet'
    | 'degree_certificate'
    | 'transfer_certificate'
    | 'character_certificate'
    | 'migration_certificate'
    | 'income_certificate'
    | 'caste_certificate'
    | 'passport_photo'
    | 'signature';

/**
 * User document
 */
export interface UserDocument {
    id: UUID;
    userId: UUID;
    documentType: DocumentType;
    documentNumber?: string;
    documentUrl: string;
    issuedDate?: ISODateString;
    expiryDate?: ISODateString;
    verifiedBy?: UUID;
    verifiedAt?: string;
    isVerified: boolean;
    createdAt: string;
}

/**
 * Complete user profile (with all related data)
 */
export interface CompleteUserProfile {
    user: User;
    studentProfile?: StudentProfile;
    professorProfile?: ProfessorProfile;
    adminProfile?: AdminProfile;
    officialProfile?: OfficialProfile;
    addresses?: Address[];
    contacts?: ContactInfo;
    guardians?: Guardian[];
    emergencyContacts?: EmergencyContact[];
    documents?: UserDocument[];
}
