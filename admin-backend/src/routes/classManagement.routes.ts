// ============================================
// Admin Backend - Class Management Routes
// Export and Safe Delete functionality
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// GET /api/admin/v1/classes/:classId/export
// Export all class data as JSON
// ============================================
router.get('/:classId/export', async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        const userId = req.query.user_id as string;

        // Get class info
        const { data: classData, error: classError } = await supabaseAdmin
            .from('classes')
            .select(`
                *,
                batches (batch_name, start_year, end_year),
                branches (branch_name, branch_code),
                sections (section_name),
                semesters (semester_number, semester_name)
            `)
            .eq('id', classId)
            .single();

        if (classError || !classData) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }

        // Get enrolled students
        const { data: students } = await supabaseAdmin
            .from('class_students')
            .select(`
                student_id,
                joined_on,
                left_on,
                is_active,
                student_profiles (
                    id,
                    roll_number,
                    users (full_name, email, phone)
                )
            `)
            .eq('class_id', classId);

        // Get assigned subjects with professors
        const { data: subjects } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                total_classes_scheduled,
                total_classes_conducted,
                is_active,
                subjects (id, subject_code, subject_name, credits),
                professor_profiles (
                    id,
                    employee_id,
                    users (full_name, email)
                )
            `)
            .eq('class_id', classId);

        // Get attendance data for each subject
        const attendanceData = [];
        if (subjects) {
            for (const subject of subjects) {
                const { data: sessions } = await supabaseAdmin
                    .from('attendance_sessions')
                    .select(`
                        id,
                        conducted_date,
                        conducted_time,
                        total_present,
                        total_absent,
                        is_finalized,
                        attendance_records (
                            student_id,
                            status,
                            marked_at
                        )
                    `)
                    .eq('class_subject_id', subject.id)
                    .order('conducted_date', { ascending: false });

                attendanceData.push({
                    class_subject_id: subject.id,
                    subject: subject.subjects,
                    sessions: sessions || []
                });
            }
        }

        // Get marks data for each subject
        const marksData = [];
        if (subjects) {
            for (const subject of subjects) {
                const { data: components } = await supabaseAdmin
                    .from('assessment_components')
                    .select(`
                        id,
                        component_name,
                        component_type,
                        max_marks,
                        weightage,
                        conducted_date,
                        student_marks (
                            student_id,
                            marks_obtained,
                            is_absent,
                            remarks,
                            entered_at
                        )
                    `)
                    .eq('class_subject_id', subject.id);

                marksData.push({
                    class_subject_id: subject.id,
                    subject: subject.subjects,
                    components: components || []
                });
            }
        }

        // Get groups and messages
        const { data: groups } = await supabaseAdmin
            .from('groups')
            .select(`
                id,
                group_name,
                group_type,
                created_at,
                group_messages (
                    id,
                    message,
                    message_type,
                    sent_at,
                    sender_id,
                    users:sender_id (full_name, role)
                )
            `)
            .eq('class_id', classId);

        // Build export object
        const exportData = {
            export_metadata: {
                exported_at: new Date().toISOString(),
                exported_by: userId,
                class_id: classId,
                class_label: classData.class_label,
            },
            class_info: {
                ...classData,
                batch: classData.batches,
                branch: classData.branches,
                section: classData.sections,
                semester: classData.semesters,
            },
            students: (students || []).map((s: any) => ({
                student_id: s.student_id,
                roll_number: s.student_profiles?.roll_number,
                full_name: s.student_profiles?.users?.full_name,
                email: s.student_profiles?.users?.email,
                phone: s.student_profiles?.users?.phone,
                joined_on: s.joined_on,
                left_on: s.left_on,
                is_active: s.is_active,
            })),
            subjects: (subjects || []).map((s: any) => ({
                class_subject_id: s.id,
                subject_code: s.subjects?.subject_code,
                subject_name: s.subjects?.subject_name,
                credits: s.subjects?.credits,
                professor_id: s.professor_profiles?.id,
                professor_name: s.professor_profiles?.users?.full_name,
                professor_email: s.professor_profiles?.users?.email,
                total_classes_scheduled: s.total_classes_scheduled,
                total_classes_conducted: s.total_classes_conducted,
            })),
            attendance: attendanceData,
            marks: marksData,
            groups: groups || [],
            statistics: {
                total_students: students?.length || 0,
                total_subjects: subjects?.length || 0,
                total_attendance_sessions: attendanceData.reduce((sum, a) => sum + a.sessions.length, 0),
                total_assessment_components: marksData.reduce((sum, m) => sum + m.components.length, 0),
            }
        };

        // Log export in history (if table exists)
        try {
            await supabaseAdmin.from('export_history').insert({
                export_type: 'class',
                entity_id: classId,
                entity_label: classData.class_label,
                export_data: exportData,
                exported_by: userId,
            });
        } catch {
            // Ignore if export_history table doesn't exist yet
        }

        res.json({
            success: true,
            message: 'Class data exported successfully',
            data: exportData
        });
    } catch (error) {
        console.error('Error exporting class data:', error);
        res.status(500).json({ success: false, message: 'Failed to export class data' });
    }
});

// ============================================
// DELETE /api/admin/v1/classes/:classId
// Safe delete with mandatory export
// ============================================
router.delete('/:classId', async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        const userId = req.query.user_id as string;
        const { reason, force_delete } = req.body;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        // Get class info
        const { data: classData, error: classError } = await supabaseAdmin
            .from('classes')
            .select('id, class_label, is_deleted')
            .eq('id', classId)
            .single();

        if (classError || !classData) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }

        if (classData.is_deleted) {
            res.status(400).json({ success: false, message: 'Class is already deleted' });
            return;
        }

        // Check for related data counts
        const { count: studentCount } = await supabaseAdmin
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classId)
            .eq('is_active', true);

        const { count: attendanceCount } = await supabaseAdmin
            .from('attendance_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('class_subject_id', classId);

        // If there's data, require confirmation
        if ((studentCount || 0) > 0 || (attendanceCount || 0) > 0) {
            if (!force_delete) {
                res.status(400).json({
                    success: false,
                    message: 'Class has active data. Export first and set force_delete=true to proceed.',
                    data: {
                        active_students: studentCount || 0,
                        attendance_sessions: attendanceCount || 0,
                        warning: 'Please export data before deletion using GET /classes/:id/export'
                    }
                });
                return;
            }
        }

        // Perform soft delete
        const { error: updateError } = await supabaseAdmin
            .from('classes')
            .update({
                is_deleted: true,
                is_active: false,
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
            })
            .eq('id', classId);

        if (updateError) {
            throw updateError;
        }

        // Soft delete related class_subjects
        await supabaseAdmin
            .from('class_subjects')
            .update({
                is_deleted: true,
                is_active: false,
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
            })
            .eq('class_id', classId);

        // Deactivate student enrollments (don't delete)
        await supabaseAdmin
            .from('class_students')
            .update({
                is_active: false,
                left_on: new Date().toISOString().split('T')[0],
            })
            .eq('class_id', classId);

        // Soft delete groups
        await supabaseAdmin
            .from('groups')
            .update({
                is_deleted: true,
                is_active: false,
                deleted_at: new Date().toISOString(),
            })
            .eq('class_id', classId);

        res.json({
            success: true,
            message: 'Class soft-deleted successfully',
            data: {
                class_id: classId,
                class_label: classData.class_label,
                deleted_at: new Date().toISOString(),
                note: 'Data is archived and can be restored. Use /restore endpoint to recover.'
            }
        });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ success: false, message: 'Failed to delete class' });
    }
});

// ============================================
// POST /api/admin/v1/classes/:classId/restore
// Restore a soft-deleted class
// ============================================
router.post('/:classId/restore', async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        const userId = req.query.user_id as string;

        // Check if class exists and is deleted
        const { data: classData, error: classError } = await supabaseAdmin
            .from('classes')
            .select('id, class_label, is_deleted')
            .eq('id', classId)
            .single();

        if (classError || !classData) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }

        if (!classData.is_deleted) {
            res.status(400).json({ success: false, message: 'Class is not deleted' });
            return;
        }

        // Restore class
        await supabaseAdmin
            .from('classes')
            .update({
                is_deleted: false,
                is_active: true,
                deleted_at: null,
                deleted_by: null,
            })
            .eq('id', classId);

        // Restore related class_subjects
        await supabaseAdmin
            .from('class_subjects')
            .update({
                is_deleted: false,
                is_active: true,
                deleted_at: null,
                deleted_by: null,
            })
            .eq('class_id', classId);

        // Restore groups
        await supabaseAdmin
            .from('groups')
            .update({
                is_deleted: false,
                is_active: true,
                deleted_at: null,
            })
            .eq('class_id', classId);

        res.json({
            success: true,
            message: 'Class restored successfully',
            data: {
                class_id: classId,
                class_label: classData.class_label,
                restored_at: new Date().toISOString(),
            }
        });
    } catch (error) {
        console.error('Error restoring class:', error);
        res.status(500).json({ success: false, message: 'Failed to restore class' });
    }
});

// ============================================
// PUT /api/admin/v1/classes/:classId
// Update class details
// ============================================
router.put('/:classId', async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        const {
            class_label,
            batch_id,
            branch_id,
            section_id,
            semester_id,
            class_teacher_id,
            current_strength,
            is_active
        } = req.body;

        // Build update object
        const updateData: any = {};
        if (class_label !== undefined) updateData.class_label = class_label;
        if (batch_id !== undefined) updateData.batch_id = batch_id;
        if (branch_id !== undefined) updateData.branch_id = branch_id;
        if (section_id !== undefined) updateData.section_id = section_id;
        if (semester_id !== undefined) updateData.semester_id = semester_id;
        if (class_teacher_id !== undefined) updateData.class_teacher_id = class_teacher_id;
        if (current_strength !== undefined) updateData.current_strength = current_strength;
        if (is_active !== undefined) updateData.is_active = is_active;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ success: false, message: 'No fields to update' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('classes')
            .update(updateData)
            .eq('id', classId)
            .eq('is_deleted', false)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                res.status(404).json({ success: false, message: 'Class not found or already deleted' });
                return;
            }
            throw error;
        }

        res.json({
            success: true,
            message: 'Class updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ success: false, message: 'Failed to update class' });
    }
});

export default router;
