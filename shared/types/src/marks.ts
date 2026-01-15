// ============================================
// Marks/Assessment System Types
// ============================================

import type { UUID, ISODateString } from './common';

/**
 * Assessment component types
 */
export type AssessmentComponentType =
    | 'assignment'
    | 'quiz'
    | 'minor'
    | 'major'
    | 'internal'
    | 'project';

/**
 * Assessment component (marks column)
 */
export interface AssessmentComponent {
    id: UUID;
    classSubjectId: UUID;
    componentName: string; // "Minor 1", "Assignment 1"
    componentType: AssessmentComponentType;
    maxMarks: number;
    weightagePercent?: number;
    conductedDate?: ISODateString;
    createdAt: string;
    isDeleted: boolean;
}

/**
 * Individual student marks
 */
export interface StudentMark {
    id: UUID;
    studentId: UUID;
    componentId: UUID;
    marksObtained: number;
    remarks?: string;
    uploadedBy: UUID;
    uploadedAt: string;
    isDeleted: boolean;
}

/**
 * Assessment component with expanded details
 */
export interface AssessmentComponentWithDetails extends AssessmentComponent {
    classSubject: {
        id: UUID;
        subject: {
            subjectName: string;
            subjectCode: string;
        };
        class: {
            id: UUID;
            classLabel: string;
        };
    };
    marksEnteredCount: number;
    totalStudentsCount: number;
    averageMarks?: number;
    highestMarks?: number;
    lowestMarks?: number;
}

/**
 * Student marks with details
 */
export interface StudentMarkWithDetails extends StudentMark {
    student: {
        id: UUID;
        fullName: string;
        rollNumber: string;
    };
    component: {
        componentName: string;
        maxMarks: number;
        componentType: AssessmentComponentType;
    };
    percentage: number;
}

/**
 * Subject marks summary for a student
 */
export interface StudentSubjectMarks {
    classSubjectId: UUID;
    subjectName: string;
    subjectCode: string;
    components: Array<{
        componentId: UUID;
        componentName: string;
        componentType: AssessmentComponentType;
        maxMarks: number;
        marksObtained?: number;
        weightagePercent?: number;
        weightedMarks?: number;
    }>;
    totalObtained: number;
    totalMax: number;
    percentage: number;
    grade?: string;
}

/**
 * Complete marks sheet for a student
 */
export interface StudentMarksSheet {
    studentId: UUID;
    studentName: string;
    rollNumber: string;
    classId: UUID;
    classLabel: string;
    semesterId: UUID;
    semesterNumber: number;
    subjectMarks: StudentSubjectMarks[];
    aggregatePercentage: number;
    aggregateGrade?: string;
    sgpa?: number;
    cgpa?: number;
}

/**
 * Class marks summary for a component
 */
export interface ClassComponentMarks {
    componentId: UUID;
    componentName: string;
    componentType: AssessmentComponentType;
    maxMarks: number;
    conductedDate?: ISODateString;
    statistics: {
        totalStudents: number;
        marksEntered: number;
        average: number;
        highest: number;
        lowest: number;
        median?: number;
        passPercentage: number;
    };
    distribution: {
        range: string; // "0-40", "41-60", etc.
        count: number;
    }[];
    students: Array<{
        studentId: UUID;
        rollNumber: string;
        fullName: string;
        marksObtained?: number;
        percentage?: number;
        grade?: string;
    }>;
}

/**
 * Request to upload marks
 */
export interface UploadMarksRequest {
    componentId: UUID;
    marks: Array<{
        studentId: UUID;
        marksObtained: number;
        remarks?: string;
    }>;
}

/**
 * Request to create assessment component
 */
export interface CreateComponentRequest {
    classSubjectId: UUID;
    componentName: string;
    componentType: AssessmentComponentType;
    maxMarks: number;
    weightagePercent?: number;
    conductedDate?: ISODateString;
}

/**
 * Grade mapping
 */
export interface GradeMapping {
    grade: string;
    minPercentage: number;
    maxPercentage: number;
    gradePoints: number;
    description: string;
}

/**
 * Default grade scale
 */
export const DEFAULT_GRADE_SCALE: GradeMapping[] = [
    { grade: 'O', minPercentage: 90, maxPercentage: 100, gradePoints: 10, description: 'Outstanding' },
    { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gradePoints: 9, description: 'Excellent' },
    { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gradePoints: 8, description: 'Very Good' },
    { grade: 'B+', minPercentage: 60, maxPercentage: 69.99, gradePoints: 7, description: 'Good' },
    { grade: 'B', minPercentage: 55, maxPercentage: 59.99, gradePoints: 6, description: 'Above Average' },
    { grade: 'C', minPercentage: 50, maxPercentage: 54.99, gradePoints: 5, description: 'Average' },
    { grade: 'P', minPercentage: 40, maxPercentage: 49.99, gradePoints: 4, description: 'Pass' },
    { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gradePoints: 0, description: 'Fail' },
];
