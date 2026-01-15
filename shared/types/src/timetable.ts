// ============================================
// Timetable System Types
// ============================================

import type { UUID, ISODateString, TimeString, DayOfWeek } from './common';
import type { SubjectType } from './academic';

/**
 * Timetable type
 */
export type TimetableType = 'image' | 'structured';

/**
 * Timetable entity
 */
export interface Timetable {
    id: UUID;
    classId: UUID;
    semesterId: UUID;
    type: TimetableType;
    imageUrl?: string; // Only for image type
    effectiveFrom?: ISODateString;
    effectiveTo?: ISODateString;
    isActive: boolean;
    createdAt: string;
    createdBy: UUID;
    isDeleted: boolean;
}

/**
 * Timetable slot (for structured timetables)
 */
export interface TimetableSlot {
    id: UUID;
    timetableId: UUID;
    dayOfWeek: DayOfWeek;
    periodNumber: number;
    startTime: TimeString;
    endTime: TimeString;
    classSubjectId?: UUID;
    roomNumber?: string;
    createdAt: string;
}

/**
 * Timetable slot with expanded details
 */
export interface TimetableSlotWithDetails extends TimetableSlot {
    classSubject?: {
        id: UUID;
        subject: {
            subjectName: string;
            subjectCode: string;
            subjectType: SubjectType;
        };
        professor?: {
            id: UUID;
            fullName: string;
        };
    };
}

/**
 * Complete timetable with all slots
 */
export interface TimetableWithSlots extends Timetable {
    class: {
        id: UUID;
        classLabel: string;
    };
    semester: {
        id: UUID;
        semesterNumber: number;
    };
    slots: TimetableSlotWithDetails[];
}

/**
 * Day-wise timetable view
 */
export interface DayTimetable {
    dayOfWeek: DayOfWeek;
    date: ISODateString;
    isToday: boolean;
    slots: TimetableSlotWithDetails[];
}

/**
 * Weekly timetable view (MS Teams style)
 */
export interface WeeklyTimetable {
    classId?: UUID;
    professorId?: UUID;
    weekStartDate: ISODateString;
    weekEndDate: ISODateString;
    days: DayTimetable[];
}

/**
 * Period definition
 */
export interface PeriodDefinition {
    periodNumber: number;
    startTime: TimeString;
    endTime: TimeString;
    label: string; // "1st Period", "Lunch", etc.
    isBreak: boolean;
}

/**
 * Default period structure
 */
export const DEFAULT_PERIODS: PeriodDefinition[] = [
    { periodNumber: 1, startTime: '09:00', endTime: '09:50', label: '1st Period', isBreak: false },
    { periodNumber: 2, startTime: '09:50', endTime: '10:40', label: '2nd Period', isBreak: false },
    { periodNumber: 0, startTime: '10:40', endTime: '11:00', label: 'Break', isBreak: true },
    { periodNumber: 3, startTime: '11:00', endTime: '11:50', label: '3rd Period', isBreak: false },
    { periodNumber: 4, startTime: '11:50', endTime: '12:40', label: '4th Period', isBreak: false },
    { periodNumber: 0, startTime: '12:40', endTime: '13:30', label: 'Lunch', isBreak: true },
    { periodNumber: 5, startTime: '13:30', endTime: '14:20', label: '5th Period', isBreak: false },
    { periodNumber: 6, startTime: '14:20', endTime: '15:10', label: '6th Period', isBreak: false },
    { periodNumber: 7, startTime: '15:10', endTime: '16:00', label: '7th Period', isBreak: false },
];

/**
 * Professor's daily schedule
 */
export interface ProfessorDailySchedule {
    professorId: UUID;
    date: ISODateString;
    dayOfWeek: DayOfWeek;
    classes: Array<{
        periodNumber: number;
        startTime: TimeString;
        endTime: TimeString;
        classId: UUID;
        classLabel: string;
        subjectName: string;
        subjectCode: string;
        roomNumber?: string;
    }>;
    totalClasses: number;
    freeSlots: number[];
}

/**
 * Student's daily schedule
 */
export interface StudentDailySchedule {
    studentId: UUID;
    classId: UUID;
    date: ISODateString;
    dayOfWeek: DayOfWeek;
    slots: Array<{
        periodNumber: number;
        startTime: TimeString;
        endTime: TimeString;
        subjectName: string;
        subjectCode: string;
        subjectType: SubjectType;
        professorName: string;
        roomNumber?: string;
        isBreak: boolean;
    }>;
}

/**
 * Request to create structured timetable
 */
export interface CreateTimetableRequest {
    classId: UUID;
    semesterId: UUID;
    type: TimetableType;
    effectiveFrom?: ISODateString;
    effectiveTo?: ISODateString;
    slots?: Array<{
        dayOfWeek: DayOfWeek;
        periodNumber: number;
        startTime: TimeString;
        endTime: TimeString;
        classSubjectId?: UUID;
        roomNumber?: string;
    }>;
}

/**
 * Request to upload image timetable
 */
export interface UploadImageTimetableRequest {
    classId: UUID;
    semesterId: UUID;
    imageFile: File;
    effectiveFrom?: ISODateString;
    effectiveTo?: ISODateString;
}
