// ============================================
// Academic Structure Types
// ============================================

import type { UUID, ISODateString, BaseEntity, SemesterType } from './common';

/**
 * Department type
 */
export type DepartmentType = 'academic' | 'administrative' | 'support';

/**
 * Department
 */
export interface Department extends BaseEntity {
    departmentName: string;
    departmentCode: string;
    departmentType: DepartmentType;
    hodId?: UUID;
    isActive: boolean;
}

/**
 * Academic year
 */
export interface AcademicYear {
    id: UUID;
    yearLabel: string; // "2024-2025"
    startDate: ISODateString;
    endDate: ISODateString;
    isCurrent: boolean;
    isActive: boolean;
    createdAt: string;
}

/**
 * Semester
 */
export interface Semester {
    id: UUID;
    academicYearId: UUID;
    semesterType: SemesterType;
    semesterNumber: number; // 1-8
    startDate: ISODateString;
    endDate: ISODateString;
    isCurrent: boolean;
    isActive: boolean;
    createdAt: string;
}

/**
 * Batch (e.g., 2023-2027)
 */
export interface Batch extends BaseEntity {
    batchName: string; // "2023-2027"
    startYear: number;
    endYear: number;
    isActive: boolean;
}

/**
 * Course (e.g., B.Tech, MBA)
 */
export interface Course extends BaseEntity {
    courseName: string;
    courseCode: string;
    durationYears: number;
}

/**
 * Branch (e.g., CSE, ECE)
 */
export interface Branch extends BaseEntity {
    courseId: UUID;
    departmentId?: UUID;
    branchName: string;
    branchCode: string;
    isActive: boolean;
}

/**
 * Section (e.g., A, B, C)
 */
export interface Section extends BaseEntity {
    branchId: UUID;
    sectionName: string;
}

/**
 * Class - The operational unit
 */
export interface Class extends BaseEntity {
    batchId: UUID;
    courseId: UUID;
    branchId: UUID;
    sectionId: UUID;
    academicYearId: UUID;
    currentSemesterId?: UUID;
    classLabel: string; // "2024-CSE-A"
    classInchargeId?: UUID;
    isActive: boolean;
}

/**
 * Class with expanded relations
 */
export interface ClassWithDetails extends Class {
    batch: Batch;
    course: Course;
    branch: Branch;
    section: Section;
    academicYear: AcademicYear;
    currentSemester?: Semester;
    classIncharge?: {
        id: UUID;
        fullName: string;
        employeeId: string;
    };
    studentCount: number;
    subjectCount: number;
}

/**
 * Subject types
 */
export type SubjectType = 'theory' | 'practical' | 'lab' | 'project';

/**
 * Subject
 */
export interface Subject extends BaseEntity {
    subjectName: string;
    subjectCode: string;
    credits?: number;
    subjectType: SubjectType;
}

/**
 * Class subject assignment (professor-subject-class link)
 */
export interface ClassSubject extends BaseEntity {
    classId: UUID;
    subjectId: UUID;
    professorId?: UUID;
    semesterId: UUID;
    totalClassesPlanned: number;
    totalClassesConducted: number;
    isActive: boolean;
}

/**
 * Class subject with expanded details
 */
export interface ClassSubjectWithDetails extends ClassSubject {
    subject: Subject;
    professor?: {
        id: UUID;
        fullName: string;
        employeeId: string;
    };
    class: {
        id: UUID;
        classLabel: string;
    };
    semester: {
        id: UUID;
        semesterNumber: number;
        semesterType: SemesterType;
    };
    attendancePercentage?: number;
}

/**
 * Class student assignment
 */
export interface ClassStudent {
    id: UUID;
    classId: UUID;
    studentId: UUID;
    isCR: boolean;
    joinedAt: string;
}

/**
 * Class student with expanded details
 */
export interface ClassStudentWithDetails extends ClassStudent {
    student: {
        id: UUID;
        userId: UUID;
        fullName: string;
        rollNumber: string;
        email: string;
        phone?: string;
    };
}

/**
 * Class representative
 */
export interface ClassRepresentative {
    id: UUID;
    classId: UUID;
    studentId: UUID;
    assignedAt: string;
    assignedBy: UUID;
}

/**
 * Academic hierarchy summary
 */
export interface AcademicHierarchy {
    batches: Batch[];
    coursesMap: Record<UUID, Course[]>;
    branchesMap: Record<UUID, Branch[]>;
    sectionsMap: Record<UUID, Section[]>;
    classesMap: Record<UUID, Class[]>;
}
