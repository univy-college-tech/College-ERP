// ============================================
// Academic Backend - Attendance Routes
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// POST /api/academic/v1/attendance
// Create attendance session and records
// ============================================
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            class_subject_id,
            conducted_date,
            conducted_time,
            attendance_records // [{ student_id, status: 'present'|'absent'|'late'|'leave' }]
        } = req.body;

        // Get user from query (for now) - in production, use auth middleware
        const userId = req.query.user_id as string;

        if (!class_subject_id || !attendance_records || !Array.isArray(attendance_records)) {
            res.status(400).json({
                success: false,
                message: 'class_subject_id and attendance_records are required'
            });
            return;
        }

        // Verify class subject exists and professor is assigned
        const { data: classSubject, error: csError } = await supabaseAdmin
            .from('class_subjects')
            .select('id, class_id, professor_id, total_classes_conducted')
            .eq('id', class_subject_id)
            .single();

        if (csError || !classSubject) {
            res.status(404).json({ success: false, message: 'Class subject not found' });
            return;
        }

        // Create attendance session
        const conductedDate = conducted_date || new Date().toISOString().split('T')[0];
        const conductedTime = conducted_time || new Date().toTimeString().slice(0, 8);

        // Check if session already exists for this date
        const { data: existingSession } = await supabaseAdmin
            .from('attendance_sessions')
            .select('id')
            .eq('class_subject_id', class_subject_id)
            .eq('conducted_date', conductedDate)
            .single();

        let session;
        let isNewSession = false;

        if (existingSession) {
            // Session exists - delete old records and update
            await supabaseAdmin
                .from('attendance_records')
                .delete()
                .eq('session_id', existingSession.id);

            const { data: updatedSession, error: updateError } = await supabaseAdmin
                .from('attendance_sessions')
                .update({
                    conducted_time: conductedTime,
                    recorded_by: classSubject.professor_id,
                    total_present: 0,
                    total_absent: 0,
                })
                .eq('id', existingSession.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating attendance session:', updateError);
                res.status(500).json({ success: false, message: 'Failed to update attendance session' });
                return;
            }
            session = updatedSession;
        } else {
            // Create new session
            const { data: newSession, error: sessionError } = await supabaseAdmin
                .from('attendance_sessions')
                .insert({
                    class_subject_id,
                    conducted_date: conductedDate,
                    conducted_time: conductedTime,
                    recorded_by: classSubject.professor_id,
                    total_present: 0,
                    total_absent: 0,
                    is_finalized: false,
                })
                .select()
                .single();

            if (sessionError) {
                console.error('Error creating attendance session:', sessionError);
                res.status(500).json({ success: false, message: 'Failed to create attendance session', error: sessionError.message });
                return;
            }
            session = newSession;
            isNewSession = true;
        }

        // Insert attendance records
        const recordsToInsert = attendance_records.map((record: any) => ({
            session_id: session.id,
            student_id: record.student_id,
            status: record.status || 'present',
        }));

        const { error: recordsError } = await supabaseAdmin
            .from('attendance_records')
            .insert(recordsToInsert);

        if (recordsError) {
            // Rollback session if new
            if (isNewSession) {
                await supabaseAdmin.from('attendance_sessions').delete().eq('id', session.id);
            }
            console.error('Error creating attendance records:', recordsError);
            res.status(500).json({ success: false, message: 'Failed to save attendance records' });
            return;
        }

        // Update total_classes_conducted ONLY for new sessions (not when updating existing)
        if (isNewSession) {
            const { error: updateError } = await supabaseAdmin
                .from('class_subjects')
                .update({
                    total_classes_conducted: (classSubject.total_classes_conducted || 0) + 1
                })
                .eq('id', class_subject_id);

            if (updateError) {
                console.error('Error updating class count:', updateError);
            }
        }

        // Calculate summary
        const presentCount = attendance_records.filter((r: any) => r.status === 'present').length;
        const absentCount = attendance_records.filter((r: any) => r.status === 'absent').length;
        const lateCount = attendance_records.filter((r: any) => r.status === 'late').length;

        res.status(201).json({
            success: true,
            message: isNewSession ? 'Attendance recorded successfully' : 'Attendance updated successfully',
            data: {
                session_id: session.id,
                class_subject_id,
                total_students: attendance_records.length,
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                total_classes_conducted: (classSubject.total_classes_conducted || 0) + (isNewSession ? 1 : 0),
            }
        });
    } catch (error) {
        console.error('Error in POST /attendance:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/attendance/session/:sessionId
// Get attendance session details
// ============================================
router.get('/session/:sessionId', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const { data: session, error } = await supabaseAdmin
            .from('attendance_sessions')
            .select(`
                *,
                class_subjects (
                    subjects (subject_name, subject_code),
                    classes (class_label)
                ),
                professor_profiles:conducted_by (
                    users (full_name)
                )
            `)
            .eq('id', sessionId)
            .single();

        if (error || !session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        // Get attendance records
        const { data: records, error: recordsError } = await supabaseAdmin
            .from('attendance_records')
            .select(`
                id,
                student_id,
                status,
                marked_at,
                student_profiles (
                    roll_number,
                    users (full_name)
                )
            `)
            .eq('session_id', sessionId)
            .order('student_profiles(roll_number)');

        if (recordsError) {
            console.error('Error fetching records:', recordsError);
        }

        const formattedRecords = (records || []).map((r: any) => ({
            id: r.id,
            student_id: r.student_id,
            status: r.status,
            roll_number: r.student_profiles?.roll_number,
            full_name: r.student_profiles?.users?.full_name,
        }));

        res.json({
            success: true,
            data: {
                id: session.id,
                conducted_at: session.conducted_at,
                session_type: session.session_type,
                is_finalized: session.is_finalized,
                subject_name: session.class_subjects?.subjects?.subject_name,
                subject_code: session.class_subjects?.subjects?.subject_code,
                class_label: session.class_subjects?.classes?.class_label,
                professor_name: session.professor_profiles?.users?.full_name,
                records: formattedRecords,
                summary: {
                    total: formattedRecords.length,
                    present: formattedRecords.filter((r: any) => r.status === 'present').length,
                    absent: formattedRecords.filter((r: any) => r.status === 'absent').length,
                    late: formattedRecords.filter((r: any) => r.status === 'late').length,
                }
            }
        });
    } catch (error) {
        console.error('Error in GET /attendance/session/:sessionId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// PUT /api/academic/v1/attendance/session/:sessionId
// Update attendance session
// ============================================
router.put('/session/:sessionId', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { attendance_records } = req.body;

        if (!attendance_records || !Array.isArray(attendance_records)) {
            res.status(400).json({ success: false, message: 'attendance_records required' });
            return;
        }

        // Update each record
        for (const record of attendance_records) {
            const { error } = await supabaseAdmin
                .from('attendance_records')
                .update({ status: record.status })
                .eq('session_id', sessionId)
                .eq('student_id', record.student_id);

            if (error) {
                console.error('Error updating record:', error);
            }
        }

        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Error in PUT /attendance/session/:sessionId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/attendance/class-subject/:classSubjectId
// Get attendance history for a class-subject
// ============================================
router.get('/class-subject/:classSubjectId', async (req: Request, res: Response) => {
    try {
        const { classSubjectId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const { data: sessions, count, error } = await supabaseAdmin
            .from('attendance_sessions')
            .select(`
                id,
                conducted_at,
                session_type,
                is_finalized,
                professor_profiles:conducted_by (
                    users (full_name)
                )
            `, { count: 'exact' })
            .eq('class_subject_id', classSubjectId)
            .order('conducted_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
            return;
        }

        // Get attendance summary for each session
        const sessionsWithSummary = await Promise.all((sessions || []).map(async (session: any) => {
            const { data: records } = await supabaseAdmin
                .from('attendance_records')
                .select('status')
                .eq('session_id', session.id);

            const summary = {
                total: records?.length || 0,
                present: records?.filter((r: any) => r.status === 'present').length || 0,
                absent: records?.filter((r: any) => r.status === 'absent').length || 0,
            };

            return {
                id: session.id,
                conducted_at: session.conducted_at,
                session_type: session.session_type,
                professor_name: session.professor_profiles?.users?.full_name,
                summary,
            };
        }));

        res.json({
            success: true,
            data: sessionsWithSummary,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            }
        });
    } catch (error) {
        console.error('Error in GET /attendance/class-subject/:classSubjectId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/attendance/my
// Get logged-in student's attendance summary
// ============================================
router.get('/my', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        // Get student profile
        const { data: student, error: studentError } = await supabaseAdmin
            .from('student_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (studentError || !student) {
            res.status(404).json({ success: false, message: 'Student not found' });
            return;
        }

        // Get active class enrollment
        const { data: enrollment, error: enrollError } = await supabaseAdmin
            .from('class_students')
            .select('class_id')
            .eq('student_id', student.id)
            .eq('is_active', true)
            .single();

        if (enrollError || !enrollment) {
            res.status(404).json({ success: false, message: 'No active enrollment' });
            return;
        }

        // Get all subjects in the class
        const { data: classSubjects, error: csError } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                total_classes_conducted,
                subjects (
                    id,
                    subject_name,
                    subject_code
                ),
                professor_profiles (
                    users (full_name)
                )
            `)
            .eq('class_id', enrollment.class_id)
            .eq('is_active', true);

        if (csError) {
            console.error('Error fetching class subjects:', csError);
            res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
            return;
        }

        // Calculate attendance for each subject
        const attendanceBySubject = await Promise.all((classSubjects || []).map(async (cs: any) => {
            // Get all attendance records for this student in this subject
            const { data: records } = await supabaseAdmin
                .from('attendance_records')
                .select(`
                    status,
                    attendance_sessions!inner (
                        class_subject_id
                    )
                `)
                .eq('student_id', student.id)
                .eq('attendance_sessions.class_subject_id', cs.id);

            const totalClasses = cs.total_classes_conducted || 0;
            const attended = records?.filter((r: any) => r.status === 'present' || r.status === 'late').length || 0;
            const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

            // Handle potential array types from Supabase
            const subjectData = Array.isArray(cs.subjects) ? cs.subjects[0] : cs.subjects;
            const profData = Array.isArray(cs.professor_profiles) ? cs.professor_profiles[0] : cs.professor_profiles;
            const userData = profData?.users;
            const userInfo = Array.isArray(userData) ? userData[0] : userData;

            return {
                class_subject_id: cs.id,
                subject_id: subjectData?.id,
                subject_name: subjectData?.subject_name,
                subject_code: subjectData?.subject_code,
                professor_name: userInfo?.full_name,
                total_classes: totalClasses,
                attended,
                percentage,
                status: percentage >= 75 ? 'good' : percentage >= 65 ? 'warning' : 'danger',
            };
        }));

        // Calculate overall attendance
        const totalClasses = attendanceBySubject.reduce((sum, s) => sum + s.total_classes, 0);
        const totalAttended = attendanceBySubject.reduce((sum, s) => sum + s.attended, 0);
        const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

        res.json({
            success: true,
            data: {
                overall: {
                    total_classes: totalClasses,
                    attended: totalAttended,
                    percentage: overallPercentage,
                    status: overallPercentage >= 75 ? 'good' : overallPercentage >= 65 ? 'warning' : 'danger',
                },
                subjects: attendanceBySubject,
            }
        });
    } catch (error) {
        console.error('Error in GET /attendance/my:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/attendance/my/:classSubjectId
// Get student's detailed attendance for a subject
// ============================================
router.get('/my/:classSubjectId', async (req: Request, res: Response) => {
    try {
        const { classSubjectId } = req.params;
        const userId = req.query.user_id as string;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        // Get student
        const { data: student } = await supabaseAdmin
            .from('student_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!student) {
            res.status(404).json({ success: false, message: 'Student not found' });
            return;
        }

        // Get subject info
        const { data: classSubject } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                total_classes_conducted,
                subjects (subject_name, subject_code),
                professor_profiles (users (full_name))
            `)
            .eq('id', classSubjectId)
            .single();

        if (!classSubject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        // Get all sessions and student's records
        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from('attendance_sessions')
            .select(`
                id,
                conducted_date,
                conducted_time,
                attendance_records (
                    student_id,
                    status
                )
            `)
            .eq('class_subject_id', classSubjectId)
            .order('conducted_date', { ascending: false });

        if (sessionsError) {
            console.error('Error fetching sessions:', sessionsError);
        }

        // Filter to get student's attendance per session
        const attendanceHistory = (sessions || []).map((session: any) => {
            const studentRecord = session.attendance_records?.find((r: any) => r.student_id === student.id);
            return {
                session_id: session.id,
                date: session.conducted_date,
                time: session.conducted_time,
                status: studentRecord?.status || 'not_marked',
            };
        });

        // Handle potential array types from Supabase
        const subjectData = Array.isArray(classSubject.subjects) ? classSubject.subjects[0] : classSubject.subjects;
        const profData = Array.isArray(classSubject.professor_profiles) ? classSubject.professor_profiles[0] : classSubject.professor_profiles;
        const userData = profData?.users;
        const userInfo = Array.isArray(userData) ? userData[0] : userData;

        res.json({
            success: true,
            data: {
                subject_name: subjectData?.subject_name,
                subject_code: subjectData?.subject_code,
                professor_name: userInfo?.full_name,
                total_classes: classSubject.total_classes_conducted || 0,
                history: attendanceHistory,
            }
        });
    } catch (error) {
        console.error('Error in GET /attendance/my/:classSubjectId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/attendance/students
// Get paginated students for attendance marking
// ============================================
router.get('/students', async (req: Request, res: Response) => {
    try {
        const classSubjectId = req.query.class_subject_id as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        if (!classSubjectId) {
            res.status(400).json({ success: false, message: 'class_subject_id is required' });
            return;
        }

        // Get the class from class_subject
        const { data: classSubject, error: csError } = await supabaseAdmin
            .from('class_subjects')
            .select('class_id')
            .eq('id', classSubjectId)
            .single();

        if (csError || !classSubject) {
            res.status(404).json({ success: false, message: 'Class subject not found' });
            return;
        }

        // Get students in the class with pagination
        const { data: students, count, error } = await supabaseAdmin
            .from('class_students')
            .select(`
                student_id,
                student_profiles (
                    id,
                    roll_number,
                    users (full_name, email)
                )
            `, { count: 'exact' })
            .eq('class_id', classSubject.class_id)
            .eq('is_active', true)
            .order('student_profiles(roll_number)')
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch students' });
            return;
        }

        const formattedStudents = (students || []).map((s: any) => ({
            id: s.student_profiles?.id,
            student_id: s.student_id,
            roll_number: s.student_profiles?.roll_number,
            full_name: s.student_profiles?.users?.full_name,
            email: s.student_profiles?.users?.email,
        }));

        res.json({
            success: true,
            data: formattedStudents,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasNext: offset + limit < (count || 0),
                hasPrev: page > 1,
            }
        });
    } catch (error) {
        console.error('Error in GET /attendance/students:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/attendance/class-subject/:classSubjectId/stats
// Get attendance statistics for a class-subject (for professor view)
// ============================================
router.get('/class-subject/:classSubjectId/stats', async (req: Request, res: Response) => {
    try {
        const { classSubjectId } = req.params;

        // Get class subject info
        const { data: classSubject, error: csError } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                class_id,
                total_classes_conducted,
                subjects (subject_name, subject_code),
                classes (class_label)
            `)
            .eq('id', classSubjectId)
            .single();

        if (csError || !classSubject) {
            res.status(404).json({ success: false, message: 'Class subject not found' });
            return;
        }

        // Get all attendance sessions for this class-subject
        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from('attendance_sessions')
            .select('id, conducted_date, conducted_time, total_present, total_absent, is_finalized')
            .eq('class_subject_id', classSubjectId)
            .order('conducted_date', { ascending: false });

        if (sessionsError) {
            console.error('Error fetching sessions:', sessionsError);
        }

        const totalSessions = sessions?.length || 0;

        // Get all students in the class
        const { data: classStudents, error: studentsError } = await supabaseAdmin
            .from('class_students')
            .select(`
                student_id,
                student_profiles (
                    id,
                    roll_number,
                    users (full_name)
                )
            `)
            .eq('class_id', classSubject.class_id)
            .eq('is_active', true);

        if (studentsError) {
            console.error('Error fetching students:', studentsError);
        }

        // Get attendance records for all students across all sessions
        const sessionIds = (sessions || []).map((s: any) => s.id);

        let studentStats: any[] = [];

        if (sessionIds.length > 0 && classStudents && classStudents.length > 0) {
            const { data: allRecords, error: recordsError } = await supabaseAdmin
                .from('attendance_records')
                .select('student_id, status, session_id')
                .in('session_id', sessionIds);

            if (recordsError) {
                console.error('Error fetching records:', recordsError);
            }

            // Calculate per-student stats
            studentStats = (classStudents || []).map((cs: any) => {
                const studentRecords = (allRecords || []).filter((r: any) => r.student_id === cs.student_profiles?.id);
                const present = studentRecords.filter((r: any) => r.status === 'present' || r.status === 'late').length;
                const absent = studentRecords.filter((r: any) => r.status === 'absent').length;
                const percentage = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;

                return {
                    student_id: cs.student_profiles?.id,
                    roll_number: cs.student_profiles?.roll_number,
                    full_name: cs.student_profiles?.users?.full_name,
                    classes_attended: present,
                    classes_absent: absent,
                    total_classes: totalSessions,
                    percentage,
                    status: percentage >= 75 ? 'good' : percentage >= 65 ? 'warning' : 'danger',
                };
            });

            // Sort by roll number
            studentStats.sort((a, b) => (a.roll_number || '').localeCompare(b.roll_number || ''));
        }

        // Calculate overall stats
        const totalPresent = studentStats.reduce((sum, s) => sum + s.classes_attended, 0);
        const totalAbsent = studentStats.reduce((sum, s) => sum + s.classes_absent, 0);
        const avgPercentage = studentStats.length > 0
            ? Math.round(studentStats.reduce((sum, s) => sum + s.percentage, 0) / studentStats.length)
            : 0;

        const subjectData = Array.isArray(classSubject.subjects) ? classSubject.subjects[0] : classSubject.subjects;
        const classData = Array.isArray(classSubject.classes) ? classSubject.classes[0] : classSubject.classes;

        res.json({
            success: true,
            data: {
                class_subject_id: classSubjectId,
                subject_name: subjectData?.subject_name,
                subject_code: subjectData?.subject_code,
                class_label: classData?.class_label,
                stats: {
                    total_sessions: totalSessions,
                    total_students: studentStats.length,
                    average_percentage: avgPercentage,
                    sessions_today: sessions?.filter((s: any) =>
                        s.conducted_date === new Date().toISOString().split('T')[0]
                    ).length || 0,
                },
                sessions: (sessions || []).slice(0, 10).map((s: any) => ({
                    id: s.id,
                    conducted_date: s.conducted_date,
                    conducted_time: s.conducted_time,
                    total_present: s.total_present,
                    total_absent: s.total_absent,
                    is_finalized: s.is_finalized,
                })),
                students: studentStats,
            },
        });
    } catch (error) {
        console.error('Error in GET /attendance/class-subject/:classSubjectId/stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
