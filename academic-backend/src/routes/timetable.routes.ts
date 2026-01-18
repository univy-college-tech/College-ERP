// ============================================
// Academic Backend - Timetable Routes
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// Helper Functions
// ============================================

function getDayOfWeek(): number {
    const day = new Date().getDay();
    // Convert Sunday (0) to 7, keep rest as is (Mon=1, Tue=2, etc.)
    return day === 0 ? 7 : day;
}

function getWeekDates(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

// ============================================
// GET /api/academic/v1/timetable/my
// Get logged-in user's timetable (professor or student)
// ============================================
router.get('/my', async (req: Request, res: Response) => {
    try {
        // Get user from auth header (for now, use query param for testing)
        const userId = req.query.user_id as string;
        const userRole = req.query.role as string || 'professor';

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        let timetableData;

        if (userRole === 'professor') {
            // Get professor's profile
            const { data: professor, error: profError } = await supabaseAdmin
                .from('professor_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (profError || !professor) {
                res.status(404).json({ success: false, message: 'Professor profile not found' });
                return;
            }

            // Get timetable slots for classes where this professor teaches
            const { data, error } = await supabaseAdmin
                .from('timetable_slots')
                .select(`
                    id,
                    day_of_week,
                    start_time,
                    end_time,
                    room_number,
                    slot_type,
                    class_subjects!inner (
                        id,
                        professor_id,
                        subjects (
                            id,
                            subject_name,
                            subject_code
                        ),
                        classes (
                            id,
                            class_label,
                            batches (batch_name),
                            branches (branch_name, branch_code)
                        )
                    )
                `)
                .eq('class_subjects.professor_id', professor.id)
                .order('day_of_week')
                .order('start_time');

            if (error) {
                console.error('Error fetching professor timetable:', error);
                res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
                return;
            }

            timetableData = data?.map((slot: any) => ({
                id: slot.id,
                day_of_week: slot.day_of_week,
                start_time: slot.start_time,
                end_time: slot.end_time,
                room_number: slot.room_number,
                slot_type: slot.slot_type,
                subject_name: slot.class_subjects?.subjects?.subject_name,
                subject_code: slot.class_subjects?.subjects?.subject_code,
                class_label: slot.class_subjects?.classes?.class_label,
                class_id: slot.class_subjects?.classes?.id,
                class_subject_id: slot.class_subjects?.id,
                batch_name: slot.class_subjects?.classes?.batches?.batch_name,
                branch_name: slot.class_subjects?.classes?.branches?.branch_name,
                branch_code: slot.class_subjects?.classes?.branches?.branch_code,
            })) || [];
        } else {
            // Student timetable - get from their assigned class
            const { data: student, error: studentError } = await supabaseAdmin
                .from('student_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (studentError || !student) {
                res.status(404).json({ success: false, message: 'Student profile not found' });
                return;
            }

            // Get student's active class
            const { data: classEnrollment, error: enrollError } = await supabaseAdmin
                .from('class_students')
                .select('class_id')
                .eq('student_id', student.id)
                .eq('is_active', true)
                .single();

            if (enrollError || !classEnrollment) {
                res.status(404).json({ success: false, message: 'No active class enrollment found' });
                return;
            }

            // Get timetable for the class
            const { data, error } = await supabaseAdmin
                .from('timetable_slots')
                .select(`
                    id,
                    day_of_week,
                    start_time,
                    end_time,
                    room_number,
                    slot_type,
                    class_subjects!inner (
                        id,
                        subjects (
                            id,
                            subject_name,
                            subject_code
                        ),
                        professor_profiles (
                            id,
                            users (full_name)
                        ),
                        classes!inner (
                            id,
                            class_label
                        )
                    )
                `)
                .eq('class_subjects.class_id', classEnrollment.class_id)
                .order('day_of_week')
                .order('start_time');

            if (error) {
                console.error('Error fetching student timetable:', error);
                res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
                return;
            }

            timetableData = data?.map((slot: any) => ({
                id: slot.id,
                day_of_week: slot.day_of_week,
                start_time: slot.start_time,
                end_time: slot.end_time,
                room_number: slot.room_number,
                slot_type: slot.slot_type,
                subject_name: slot.class_subjects?.subjects?.subject_name,
                subject_code: slot.class_subjects?.subjects?.subject_code,
                professor_name: slot.class_subjects?.professor_profiles?.users?.full_name,
                class_label: slot.class_subjects?.classes?.class_label,
                class_id: slot.class_subjects?.classes?.id,
                class_subject_id: slot.class_subjects?.id,
            })) || [];
        }

        res.json({ success: true, data: timetableData });
    } catch (error) {
        console.error('Error in GET /timetable/my:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/timetable/today
// Get today's schedule for logged-in user
// ============================================
router.get('/today', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;
        const userRole = req.query.role as string || 'professor';
        const today = getDayOfWeek();

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        if (userRole === 'professor') {
            // Get professor's profile
            const { data: professor, error: profError } = await supabaseAdmin
                .from('professor_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (profError || !professor) {
                res.status(404).json({ success: false, message: 'Professor profile not found' });
                return;
            }

            // Get today's classes for this professor
            const { data, error } = await supabaseAdmin
                .from('timetable_slots')
                .select(`
                    id,
                    day_of_week,
                    start_time,
                    end_time,
                    room_number,
                    slot_type,
                    class_subjects!inner (
                        id,
                        professor_id,
                        total_classes_conducted,
                        subjects (
                            id,
                            subject_name,
                            subject_code
                        ),
                        classes (
                            id,
                            class_label,
                            batches (batch_name),
                            branches (branch_name, branch_code)
                        )
                    )
                `)
                .eq('class_subjects.professor_id', professor.id)
                .eq('day_of_week', today)
                .order('start_time');

            if (error) {
                console.error('Error fetching today schedule:', error);
                res.status(500).json({ success: false, message: 'Failed to fetch schedule' });
                return;
            }

            // Get student count for each class
            const todayClasses = await Promise.all((data || []).map(async (slot: any) => {
                const classId = slot.class_subjects?.classes?.id;
                let studentCount = 0;

                if (classId) {
                    const { count } = await supabaseAdmin
                        .from('class_students')
                        .select('*', { count: 'exact', head: true })
                        .eq('class_id', classId)
                        .eq('is_active', true);
                    studentCount = count || 0;
                }

                // Get CR for this class
                let crInfo = null;
                if (classId) {
                    const { data: cr } = await supabaseAdmin
                        .from('class_representatives')
                        .select(`
                            id,
                            student_profiles (
                                id,
                                roll_number,
                                users (full_name, phone, email)
                            )
                        `)
                        .eq('class_id', classId)
                        .eq('is_active', true)
                        .eq('representative_type', 'cr')
                        .single();

                    if (cr) {
                        crInfo = {
                            id: cr.student_profiles?.id,
                            name: cr.student_profiles?.users?.full_name,
                            phone: cr.student_profiles?.users?.phone,
                            email: cr.student_profiles?.users?.email,
                            roll_number: cr.student_profiles?.roll_number,
                        };
                    }
                }

                return {
                    id: slot.id,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    room_number: slot.room_number,
                    slot_type: slot.slot_type,
                    subject_name: slot.class_subjects?.subjects?.subject_name,
                    subject_code: slot.class_subjects?.subjects?.subject_code,
                    class_label: slot.class_subjects?.classes?.class_label,
                    class_id: classId,
                    class_subject_id: slot.class_subjects?.id,
                    batch_name: slot.class_subjects?.classes?.batches?.batch_name,
                    branch_code: slot.class_subjects?.classes?.branches?.branch_code,
                    total_classes_conducted: slot.class_subjects?.total_classes_conducted || 0,
                    student_count: studentCount,
                    cr: crInfo,
                };
            }));

            res.json({
                success: true,
                data: {
                    day_of_week: today,
                    date: new Date().toISOString().split('T')[0],
                    classes: todayClasses,
                }
            });
        } else {
            // Student's today schedule
            const { data: student } = await supabaseAdmin
                .from('student_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (!student) {
                res.status(404).json({ success: false, message: 'Student not found' });
                return;
            }

            const { data: enrollment } = await supabaseAdmin
                .from('class_students')
                .select('class_id')
                .eq('student_id', student.id)
                .eq('is_active', true)
                .single();

            if (!enrollment) {
                res.status(404).json({ success: false, message: 'No active enrollment' });
                return;
            }

            const { data, error } = await supabaseAdmin
                .from('timetable_slots')
                .select(`
                    id,
                    day_of_week,
                    start_time,
                    end_time,
                    room_number,
                    slot_type,
                    class_subjects!inner (
                        id,
                        subjects (subject_name, subject_code),
                        professor_profiles (users (full_name)),
                        classes!inner (id, class_label)
                    )
                `)
                .eq('class_subjects.class_id', enrollment.class_id)
                .eq('day_of_week', today)
                .order('start_time');

            if (error) {
                res.status(500).json({ success: false, message: 'Failed to fetch schedule' });
                return;
            }

            const todayClasses = (data || []).map((slot: any) => ({
                id: slot.id,
                start_time: slot.start_time,
                end_time: slot.end_time,
                room_number: slot.room_number,
                slot_type: slot.slot_type,
                subject_name: slot.class_subjects?.subjects?.subject_name,
                subject_code: slot.class_subjects?.subjects?.subject_code,
                professor_name: slot.class_subjects?.professor_profiles?.users?.full_name,
                class_subject_id: slot.class_subjects?.id,
            }));

            res.json({
                success: true,
                data: {
                    day_of_week: today,
                    date: new Date().toISOString().split('T')[0],
                    classes: todayClasses,
                }
            });
        }
    } catch (error) {
        console.error('Error in GET /timetable/today:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/timetable/class/:classId
// Get timetable for a specific class
// ============================================
router.get('/class/:classId', async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;

        const { data, error } = await supabaseAdmin
            .from('timetable_slots')
            .select(`
                id,
                day_of_week,
                start_time,
                end_time,
                room_number,
                slot_type,
                class_subjects!inner (
                    id,
                    subjects (
                        id,
                        subject_name,
                        subject_code
                    ),
                    professor_profiles (
                        id,
                        users (full_name)
                    ),
                    classes!inner (
                        id,
                        class_label
                    )
                )
            `)
            .eq('class_subjects.class_id', classId)
            .order('day_of_week')
            .order('start_time');

        if (error) {
            console.error('Error fetching class timetable:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
            return;
        }

        const timetable = (data || []).map((slot: any) => ({
            id: slot.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            room_number: slot.room_number,
            slot_type: slot.slot_type,
            subject_name: slot.class_subjects?.subjects?.subject_name,
            subject_code: slot.class_subjects?.subjects?.subject_code,
            professor_name: slot.class_subjects?.professor_profiles?.users?.full_name,
            class_subject_id: slot.class_subjects?.id,
        }));

        res.json({ success: true, data: timetable });
    } catch (error) {
        console.error('Error in GET /timetable/class/:classId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/timetable/professor/:professorId
// Get professor's teaching schedule
// ============================================
router.get('/professor/:professorId', async (req: Request, res: Response) => {
    try {
        const { professorId } = req.params;

        const { data, error } = await supabaseAdmin
            .from('timetable_slots')
            .select(`
                id,
                day_of_week,
                start_time,
                end_time,
                room_number,
                slot_type,
                class_subjects!inner (
                    id,
                    professor_id,
                    subjects (
                        id,
                        subject_name,
                        subject_code
                    ),
                    classes (
                        id,
                        class_label,
                        batches (batch_name),
                        branches (branch_name, branch_code)
                    )
                )
            `)
            .eq('class_subjects.professor_id', professorId)
            .order('day_of_week')
            .order('start_time');

        if (error) {
            console.error('Error fetching professor timetable:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
            return;
        }

        const timetable = (data || []).map((slot: any) => ({
            id: slot.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            room_number: slot.room_number,
            slot_type: slot.slot_type,
            subject_name: slot.class_subjects?.subjects?.subject_name,
            subject_code: slot.class_subjects?.subjects?.subject_code,
            class_label: slot.class_subjects?.classes?.class_label,
            class_id: slot.class_subjects?.classes?.id,
            class_subject_id: slot.class_subjects?.id,
            batch_name: slot.class_subjects?.classes?.batches?.batch_name,
            branch_code: slot.class_subjects?.classes?.branches?.branch_code,
        }));

        res.json({ success: true, data: timetable });
    } catch (error) {
        console.error('Error in GET /timetable/professor/:professorId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/timetable/week
// Get weekly timetable view
// ============================================
router.get('/week', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;
        const userRole = req.query.role as string || 'professor';

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        // Reuse /my endpoint logic to get full week
        const { start, end } = getWeekDates();

        // For now, redirect to /my which returns all days
        res.redirect(`/api/academic/v1/timetable/my?user_id=${userId}&role=${userRole}`);
    } catch (error) {
        console.error('Error in GET /timetable/week:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/timetable/assigned-classes
// Get list of classes where professor teaches (for dropdowns)
// ============================================
router.get('/assigned-classes', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        // Get professor profile
        const { data: professor, error: profError } = await supabaseAdmin
            .from('professor_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (profError || !professor) {
            res.status(404).json({ success: false, message: 'Professor not found' });
            return;
        }

        // Get assigned class-subjects
        const { data, error } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                subjects (
                    id,
                    subject_name,
                    subject_code
                ),
                classes (
                    id,
                    class_label,
                    batches (batch_name, batch_year),
                    branches (branch_name, branch_code)
                )
            `)
            .eq('professor_id', professor.id)
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching assigned classes:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch assigned classes' });
            return;
        }

        // Get student count for each class
        const assignedClasses = await Promise.all((data || []).map(async (cs: any) => {
            const { count } = await supabaseAdmin
                .from('class_students')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', cs.classes?.id)
                .eq('is_active', true);

            return {
                class_subject_id: cs.id,
                class_id: cs.classes?.id,
                class_label: cs.classes?.class_label,
                subject_id: cs.subjects?.id,
                subject_name: cs.subjects?.subject_name,
                subject_code: cs.subjects?.subject_code,
                batch_name: cs.classes?.batches?.batch_name,
                batch_year: cs.classes?.batches?.batch_year,
                branch_name: cs.classes?.branches?.branch_name,
                branch_code: cs.classes?.branches?.branch_code,
                student_count: count || 0,
            };
        }));

        res.json({ success: true, data: assignedClasses });
    } catch (error) {
        console.error('Error in GET /timetable/assigned-classes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
