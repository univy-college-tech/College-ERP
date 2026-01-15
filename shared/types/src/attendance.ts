// ============================================
// Attendance System Types
// ============================================

import type { UUID, ISODateString, TimeString } from './common';

/**
 * Attendance status
 */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

/**
 * Attendance session (one class period)
 */
export interface AttendanceSession {
    id: UUID;
    classSubjectId: UUID;
    conductedDate: ISODateString;
    conductedTime?: TimeString;
    recordedBy: UUID;
    totalPresent: number;
    totalAbsent: number;
    isFinalized: boolean;
    createdAt: string;
}

/**
 * Individual attendance record
 */
export interface AttendanceRecord {
    id: UUID;
    sessionId: UUID;
    studentId: UUID;
    status: AttendanceStatus;
    markedAt: string;
}

/**
 * Attendance session with expanded details
 */
export interface AttendanceSessionWithDetails extends AttendanceSession {
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
    recordedByProfessor: {
        id: UUID;
        fullName: string;
    };
    records?: AttendanceRecordWithStudent[];
}

/**
 * Attendance record with student details
 */
export interface AttendanceRecordWithStudent extends AttendanceRecord {
    student: {
        id: UUID;
        fullName: string;
        rollNumber: string;
    };
}

/**
 * Student attendance summary for a subject
 */
export interface StudentSubjectAttendance {
    classSubjectId: UUID;
    subjectName: string;
    subjectCode: string;
    totalClasses: number;
    classesAttended: number;
    classesAbsent: number;
    attendancePercentage: number;
    status: 'good' | 'warning' | 'critical';
}

/**
 * Student's overall attendance summary
 */
export interface StudentAttendanceSummary {
    studentId: UUID;
    semesterId: UUID;
    subjectWise: StudentSubjectAttendance[];
    overallPercentage: number;
    totalClasses: number;
    totalAttended: number;
    lastUpdated: string;
}

/**
 * Class attendance summary for a session
 */
export interface ClassAttendanceSummary {
    sessionId: UUID;
    classSubjectId: UUID;
    date: ISODateString;
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
}

/**
 * Request to mark attendance
 */
export interface MarkAttendanceRequest {
    classSubjectId: UUID;
    date: ISODateString;
    time?: TimeString;
    records: Array<{
        studentId: UUID;
        status: AttendanceStatus;
    }>;
}

/**
 * Request to update attendance
 */
export interface UpdateAttendanceRequest {
    sessionId: UUID;
    records: Array<{
        studentId: UUID;
        status: AttendanceStatus;
    }>;
}

/**
 * Attendance pagination for 10-student UI
 */
export interface AttendancePaginatedView {
    sessionId: UUID;
    pageNumber: number;
    pageSize: number;
    totalStudents: number;
    totalPages: number;
    students: Array<{
        id: UUID;
        fullName: string;
        rollNumber: string;
        currentStatus?: AttendanceStatus;
    }>;
    markedCount: number;
    unmarkedCount: number;
}

/**
 * Professor's attendance history for a subject
 */
export interface ProfessorAttendanceHistory {
    classSubjectId: UUID;
    subjectName: string;
    classLabel: string;
    sessions: AttendanceSession[];
    totalSessionsConducted: number;
    averageAttendance: number;
}

/**
 * Low attendance alert
 */
export interface LowAttendanceAlert {
    studentId: UUID;
    studentName: string;
    rollNumber: string;
    classSubjectId: UUID;
    subjectName: string;
    attendancePercentage: number;
    threshold: number;
}
