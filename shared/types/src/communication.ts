// ============================================
// Communication & Notification Types
// ============================================

import type { UUID, ISODateTimeString } from './common';

/**
 * Group types
 */
export type GroupType = 'class_subject' | 'class_general' | 'cr_professor' | 'admin';

/**
 * Group member role
 */
export type GroupMemberRole = 'admin' | 'member' | 'moderator';

/**
 * Group entity
 */
export interface Group {
    id: UUID;
    groupType: GroupType;
    groupName: string;
    classId?: UUID;
    classSubjectId?: UUID;
    createdBy: UUID;
    createdAt: string;
    isDeleted: boolean;
}

/**
 * Group member
 */
export interface GroupMember {
    id: UUID;
    groupId: UUID;
    userId: UUID;
    role: GroupMemberRole;
    joinedAt: string;
}

/**
 * Group message
 */
export interface GroupMessage {
    id: UUID;
    groupId: UUID;
    senderId: UUID;
    messageText: string;
    createdAt: string;
}

/**
 * Group with expanded details
 */
export interface GroupWithDetails extends Group {
    memberCount: number;
    lastMessage?: {
        messageText: string;
        senderName: string;
        createdAt: string;
    };
    class?: {
        id: UUID;
        classLabel: string;
    };
    classSubject?: {
        id: UUID;
        subjectName: string;
    };
}

/**
 * Group message with sender details
 */
export interface GroupMessageWithSender extends GroupMessage {
    sender: {
        id: UUID;
        fullName: string;
        role: string;
    };
    isOwn: boolean;
}

/**
 * Announcement types
 */
export type AnnouncementType =
    | 'general'
    | 'academic'
    | 'exam'
    | 'event'
    | 'urgent'
    | 'holiday';

/**
 * Announcement priority
 */
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Target audience for announcements
 */
export type TargetAudience = 'all' | 'students' | 'professors' | 'admins' | 'custom';

/**
 * Announcement entity
 */
export interface Announcement {
    id: UUID;
    title: string;
    content: string;
    announcementType: AnnouncementType;
    priority: AnnouncementPriority;
    targetAudience: TargetAudience;
    targetDepartmentIds?: UUID[];
    targetBatchIds?: UUID[];
    targetClassIds?: UUID[];
    attachmentUrl?: string;
    validFrom?: ISODateTimeString;
    validUntil?: ISODateTimeString;
    isPinned: boolean;
    createdBy: UUID;
    createdAt: string;
    isDeleted: boolean;
}

/**
 * Announcement with expanded details
 */
export interface AnnouncementWithDetails extends Announcement {
    creator: {
        id: UUID;
        fullName: string;
        role: string;
    };
    readCount: number;
    totalTargetCount: number;
}

/**
 * Notification types
 */
export type NotificationType =
    | 'attendance_marked'
    | 'marks_uploaded'
    | 'timetable_updated'
    | 'announcement'
    | 'fee_due'
    | 'leave_status'
    | 'group_message'
    | 'reminder'
    | 'system';

/**
 * Notification entity
 */
export interface Notification {
    id: UUID;
    userId: UUID;
    title: string;
    message: string;
    notificationType: NotificationType;
    referenceType?: string;
    referenceId?: UUID;
    isRead: boolean;
    readAt?: ISODateTimeString;
    createdAt: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
    userId: UUID;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    categories: {
        attendance: boolean;
        marks: boolean;
        timetable: boolean;
        announcements: boolean;
        fees: boolean;
        groups: boolean;
    };
}

/**
 * Send notification request
 */
export interface SendNotificationRequest {
    userIds: UUID[];
    title: string;
    message: string;
    notificationType: NotificationType;
    referenceType?: string;
    referenceId?: UUID;
}

/**
 * Create announcement request
 */
export interface CreateAnnouncementRequest {
    title: string;
    content: string;
    announcementType: AnnouncementType;
    priority: AnnouncementPriority;
    targetAudience: TargetAudience;
    targetDepartmentIds?: UUID[];
    targetBatchIds?: UUID[];
    targetClassIds?: UUID[];
    attachmentUrl?: string;
    validFrom?: ISODateTimeString;
    validUntil?: ISODateTimeString;
    isPinned?: boolean;
}
