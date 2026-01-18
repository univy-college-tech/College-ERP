// ============================================
// Academic Backend - Groups Routes
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// GET /api/academic/v1/groups
// Get user's groups
// ============================================
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;
        const userRole = req.query.role as string || 'student';

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        let groups: any[] = [];

        if (userRole === 'professor') {
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

            // Get groups where professor teaches (class-subject groups)
            const { data: classSubjects, error: csError } = await supabaseAdmin
                .from('class_subjects')
                .select(`
                    id,
                    subjects (id, subject_name, subject_code),
                    classes (
                        id,
                        class_label,
                        class_teacher_id
                    )
                `)
                .eq('professor_id', professor.id)
                .eq('is_active', true);

            if (csError) {
                console.error('Error fetching class subjects:', csError);
            }

            // For each class-subject, create a group representation
            // In a real system, you'd have an actual groups table linked to class_subjects
            const groupsFromSubjects = await Promise.all((classSubjects || []).map(async (cs: any) => {
                // Get student count
                const { count } = await supabaseAdmin
                    .from('class_students')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', cs.classes?.id)
                    .eq('is_active', true);

                // Check if professor is class in-charge
                const isClassIncharge = cs.classes?.class_teacher_id === professor.id;

                // Get CR info
                let crInfo = null;
                const { data: cr } = await supabaseAdmin
                    .from('class_representatives')
                    .select(`
                        student_profiles (
                            id,
                            roll_number,
                            users (full_name, phone, email)
                        )
                    `)
                    .eq('class_id', cs.classes?.id)
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

                // Get or create group for this class-subject
                let { data: group } = await supabaseAdmin
                    .from('groups')
                    .select('id')
                    .eq('class_subject_id', cs.id)
                    .single();

                // If no group exists, we could create one
                // For now, use class_subject_id as group identifier
                const groupId = group?.id || cs.id;

                // Get unread count (messages after last read)
                // Simplified: just get recent message count
                const { count: unreadCount } = await supabaseAdmin
                    .from('group_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', groupId)
                    .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24h

                return {
                    id: groupId,
                    class_subject_id: cs.id,
                    class_id: cs.classes?.id,
                    name: `${cs.subjects?.subject_code} - ${cs.classes?.class_label}`,
                    subject_name: cs.subjects?.subject_name,
                    subject_code: cs.subjects?.subject_code,
                    class_label: cs.classes?.class_label,
                    member_count: (count || 0) + 1, // +1 for professor
                    is_class_incharge: isClassIncharge,
                    cr: crInfo,
                    unread_count: unreadCount || 0,
                    type: 'subject',
                };
            }));

            groups = groupsFromSubjects;
        } else {
            // Student: get groups for their class
            const { data: student, error: studentError } = await supabaseAdmin
                .from('student_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (studentError || !student) {
                res.status(404).json({ success: false, message: 'Student not found' });
                return;
            }

            // Get active enrollment
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

            // Get all subjects in the class (each is a group)
            const { data: classSubjects, error: csError } = await supabaseAdmin
                .from('class_subjects')
                .select(`
                    id,
                    subjects (id, subject_name, subject_code),
                    professor_profiles (
                        id,
                        users (full_name)
                    ),
                    classes (id, class_label)
                `)
                .eq('class_id', enrollment.class_id)
                .eq('is_active', true);

            if (csError) {
                console.error('Error fetching class subjects:', csError);
            }

            const studentGroups = await Promise.all((classSubjects || []).map(async (cs: any) => {
                const { count } = await supabaseAdmin
                    .from('class_students')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', enrollment.class_id)
                    .eq('is_active', true);

                return {
                    id: cs.id, // Using class_subject_id as group id
                    class_subject_id: cs.id,
                    class_id: enrollment.class_id,
                    name: `${cs.subjects?.subject_code} - ${cs.classes?.class_label}`,
                    subject_name: cs.subjects?.subject_name,
                    subject_code: cs.subjects?.subject_code,
                    class_label: cs.classes?.class_label,
                    professor_name: cs.professor_profiles?.users?.full_name,
                    member_count: (count || 0) + 1,
                    type: 'subject',
                };
            }));

            groups = studentGroups;
        }

        // Sort: class in-charge groups first
        groups.sort((a, b) => {
            if (a.is_class_incharge && !b.is_class_incharge) return -1;
            if (!a.is_class_incharge && b.is_class_incharge) return 1;
            return 0;
        });

        res.json({ success: true, data: groups });
    } catch (error) {
        console.error('Error in GET /groups:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/groups/:groupId
// Get group details
// ============================================
router.get('/:groupId', async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;

        // Try to find by group id first
        let { data: group, error } = await supabaseAdmin
            .from('groups')
            .select(`
                id,
                group_name,
                group_type,
                class_id,
                class_subject_id,
                created_at
            `)
            .eq('id', groupId)
            .single();

        // If not found, it might be using class_subject_id as group id
        if (error || !group) {
            // Fallback: treat groupId as class_subject_id
            const { data: classSubject, error: csError } = await supabaseAdmin
                .from('class_subjects')
                .select(`
                    id,
                    subjects (id, subject_name, subject_code),
                    professor_profiles (
                        id,
                        users (full_name)
                    ),
                    classes (id, class_label)
                `)
                .eq('id', groupId)
                .single();

            if (csError || !classSubject) {
                res.status(404).json({ success: false, message: 'Group not found' });
                return;
            }

            // Return class-subject as group
            const { count } = await supabaseAdmin
                .from('class_students')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', classSubject.classes?.id)
                .eq('is_active', true);

            res.json({
                success: true,
                data: {
                    id: classSubject.id,
                    name: `${classSubject.subjects?.subject_code} - ${classSubject.classes?.class_label}`,
                    subject_name: classSubject.subjects?.subject_name,
                    professor_name: classSubject.professor_profiles?.users?.full_name,
                    class_label: classSubject.classes?.class_label,
                    member_count: (count || 0) + 1,
                    type: 'subject',
                }
            });
            return;
        }

        res.json({ success: true, data: group });
    } catch (error) {
        console.error('Error in GET /groups/:groupId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/groups/:groupId/messages
// Get group messages with pagination
// ============================================
router.get('/:groupId/messages', async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;

        const { data: messages, count, error } = await supabaseAdmin
            .from('group_messages')
            .select(`
                id,
                message,
                message_type,
                sent_at,
                sender_id,
                users:sender_id (
                    full_name,
                    role
                )
            `, { count: 'exact' })
            .eq('group_id', groupId)
            .order('sent_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch messages' });
            return;
        }

        // Reverse to show oldest first in the chunk
        const formattedMessages = (messages || []).reverse().map((m: any) => ({
            id: m.id,
            content: m.message, // Map 'message' to 'content' for frontend
            type: m.message_type || 'text',
            created_at: m.sent_at, // Map 'sent_at' to 'created_at' for frontend
            sender: {
                id: m.sender_id,
                name: m.users?.full_name || 'Unknown',
                role: m.users?.role || 'member',
            }
        }));

        res.json({
            success: true,
            data: formattedMessages,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasMore: offset + limit < (count || 0),
            }
        });
    } catch (error) {
        console.error('Error in GET /groups/:groupId/messages:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// POST /api/academic/v1/groups/:groupId/messages
// Send message to group
// ============================================
router.post('/:groupId/messages', async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { content, message_type } = req.body;
        const userId = req.query.user_id as string || req.body.user_id;

        if (!content || !userId) {
            res.status(400).json({ success: false, message: 'content and user_id are required' });
            return;
        }

        // First check if group exists, if not create it for the class_subject
        let { data: group } = await supabaseAdmin
            .from('groups')
            .select('id')
            .eq('class_subject_id', groupId)
            .single();

        // If no group exists for this class_subject, create one
        if (!group) {
            // Get class_subject info to create group name
            const { data: classSubject } = await supabaseAdmin
                .from('class_subjects')
                .select(`
                    id,
                    class_id,
                    subjects (subject_name, subject_code),
                    classes (class_label)
                `)
                .eq('id', groupId)
                .single();

            if (classSubject) {
                const subjectData = Array.isArray(classSubject.subjects) ? classSubject.subjects[0] : classSubject.subjects;
                const classData = Array.isArray(classSubject.classes) ? classSubject.classes[0] : classSubject.classes;

                const { data: newGroup, error: createError } = await supabaseAdmin
                    .from('groups')
                    .insert({
                        group_type: 'class_subject',
                        group_name: `${subjectData?.subject_code || 'Subject'} - ${classData?.class_label || 'Class'}`,
                        class_id: classSubject.class_id,
                        class_subject_id: groupId,
                        created_by: userId,
                        is_active: true,
                    })
                    .select('id')
                    .single();

                if (createError) {
                    console.error('Error creating group:', createError);
                    res.status(500).json({ success: false, message: 'Failed to create group' });
                    return;
                }
                group = newGroup;
            }
        }

        const actualGroupId = group?.id || groupId;

        const { data, error } = await supabaseAdmin
            .from('group_messages')
            .insert({
                group_id: actualGroupId,
                sender_id: userId,
                message: content, // Use 'message' not 'content'
                message_type: message_type || 'text',
            })
            .select(`
                id,
                message,
                message_type,
                sent_at,
                sender_id,
                users:sender_id (full_name, role)
            `)
            .single();

        if (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
            return;
        }

        const userData = Array.isArray(data.users) ? data.users[0] : data.users;

        res.status(201).json({
            success: true,
            message: 'Message sent',
            data: {
                id: data.id,
                content: data.message, // Map to 'content' for frontend
                type: data.message_type,
                created_at: data.sent_at, // Map to 'created_at' for frontend
                sender: {
                    id: data.sender_id,
                    name: userData?.full_name,
                    role: userData?.role,
                }
            }
        });
    } catch (error) {
        console.error('Error in POST /groups/:groupId/messages:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/groups/:groupId/members
// Get group members
// ============================================
router.get('/:groupId/members', async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;

        // First try to get group from groups table
        let classId: string | null = null;
        let professorId: string | null = null;

        const { data: group } = await supabaseAdmin
            .from('groups')
            .select('class_id, class_subject_id')
            .eq('id', groupId)
            .single();

        if (group) {
            classId = group.class_id;
        } else {
            // Treat groupId as class_subject_id
            const { data: classSubject } = await supabaseAdmin
                .from('class_subjects')
                .select('class_id, professor_id')
                .eq('id', groupId)
                .single();

            if (classSubject) {
                classId = classSubject.class_id;
                professorId = classSubject.professor_id;
            }
        }

        if (!classId) {
            res.status(404).json({ success: false, message: 'Group not found' });
            return;
        }

        // Get students in the class
        const { data: students, error: studentsError } = await supabaseAdmin
            .from('class_students')
            .select(`
                student_profiles (
                    id,
                    roll_number,
                    users (id, full_name, email)
                )
            `)
            .eq('class_id', classId)
            .eq('is_active', true);

        if (studentsError) {
            console.error('Error fetching students:', studentsError);
        }

        // Get CR
        const { data: cr } = await supabaseAdmin
            .from('class_representatives')
            .select('student_id')
            .eq('class_id', classId)
            .eq('is_active', true)
            .eq('representative_type', 'cr')
            .single();

        // Get professor if available
        let professor = null;
        if (professorId) {
            const { data: prof } = await supabaseAdmin
                .from('professor_profiles')
                .select(`
                    id,
                    employee_id,
                    users (id, full_name, email)
                `)
                .eq('id', professorId)
                .single();

            if (prof) {
                professor = {
                    id: prof.users?.id,
                    profile_id: prof.id,
                    name: prof.users?.full_name,
                    email: prof.users?.email,
                    role: 'professor',
                };
            }
        }

        const members = (students || []).map((s: any) => ({
            id: s.student_profiles?.users?.id,
            profile_id: s.student_profiles?.id,
            name: s.student_profiles?.users?.full_name,
            email: s.student_profiles?.users?.email,
            roll_number: s.student_profiles?.roll_number,
            role: 'student',
            is_cr: s.student_profiles?.id === cr?.student_id,
        }));

        // Add professor at the beginning
        if (professor) {
            members.unshift(professor);
        }

        res.json({
            success: true,
            data: members,
            count: members.length,
        });
    } catch (error) {
        console.error('Error in GET /groups/:groupId/members:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/groups/crs/my-classes
// Get CRs of classes where professor is in-charge or teaches
// ============================================
router.get('/crs/my-classes', async (req: Request, res: Response) => {
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

        // Get classes where professor teaches
        const { data: classSubjects } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                classes (
                    id,
                    class_label,
                    class_teacher_id
                )
            `)
            .eq('professor_id', professor.id)
            .eq('is_active', true);

        // Extract unique classes
        const classesMap = new Map();
        (classSubjects || []).forEach((cs: any) => {
            if (cs.classes && !classesMap.has(cs.classes.id)) {
                classesMap.set(cs.classes.id, {
                    ...cs.classes,
                    is_class_incharge: cs.classes.class_teacher_id === professor.id,
                });
            }
        });

        // Get CRs for each class
        const crs = await Promise.all(Array.from(classesMap.values()).map(async (cls: any) => {
            const { data: cr } = await supabaseAdmin
                .from('class_representatives')
                .select(`
                    student_profiles (
                        id,
                        roll_number,
                        users (full_name, phone, email)
                    )
                `)
                .eq('class_id', cls.id)
                .eq('is_active', true)
                .eq('representative_type', 'cr')
                .single();

            return {
                class_id: cls.id,
                class_label: cls.class_label,
                is_class_incharge: cls.is_class_incharge,
                cr: cr ? {
                    id: cr.student_profiles?.id,
                    name: cr.student_profiles?.users?.full_name,
                    phone: cr.student_profiles?.users?.phone,
                    email: cr.student_profiles?.users?.email,
                    roll_number: cr.student_profiles?.roll_number,
                } : null,
            };
        }));

        // Sort: class in-charge first
        crs.sort((a, b) => {
            if (a.is_class_incharge && !b.is_class_incharge) return -1;
            if (!a.is_class_incharge && b.is_class_incharge) return 1;
            return 0;
        });

        res.json({ success: true, data: crs });
    } catch (error) {
        console.error('Error in GET /groups/crs/my-classes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
