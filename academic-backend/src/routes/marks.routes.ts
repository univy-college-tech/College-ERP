// ============================================
// Academic Backend - Marks Routes
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// POST /api/academic/v1/marks/components
// Create assessment component
// ============================================
router.post('/components', async (req: Request, res: Response) => {
    try {
        const {
            class_subject_id,
            component_name,
            max_marks,
            weightage,
            component_type // 'minor', 'major', 'assignment', 'quiz', 'practical', 'project'
        } = req.body;

        if (!class_subject_id || !component_name || !max_marks) {
            res.status(400).json({
                success: false,
                message: 'class_subject_id, component_name, and max_marks are required'
            });
            return;
        }

        // Create component
        const { data, error } = await supabaseAdmin
            .from('assessment_components')
            .insert({
                class_subject_id,
                component_name,
                max_marks,
                weightage: weightage || 0,
                component_type: component_type || 'assignment',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating component:', error);
            res.status(500).json({ success: false, message: 'Failed to create component', error: error.message });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Assessment component created',
            data
        });
    } catch (error) {
        console.error('Error in POST /marks/components:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/marks/components/:classSubjectId
// Get all assessment components for a class-subject
// ============================================
router.get('/components/:classSubjectId', async (req: Request, res: Response) => {
    try {
        const { classSubjectId } = req.params;

        const { data: classSubject, error: csError } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                subjects (subject_name, subject_code),
                classes (class_label)
            `)
            .eq('id', classSubjectId)
            .single();

        if (csError || !classSubject) {
            res.status(404).json({ success: false, message: 'Class subject not found' });
            return;
        }

        const { data: components, error } = await supabaseAdmin
            .from('assessment_components')
            .select('*')
            .eq('class_subject_id', classSubjectId)
            .order('created_at');

        if (error) {
            console.error('Error fetching components:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch components' });
            return;
        }

        res.json({
            success: true,
            data: {
                class_subject: {
                    id: classSubject.id,
                    subject_name: classSubject.subjects?.subject_name,
                    subject_code: classSubject.subjects?.subject_code,
                    class_label: classSubject.classes?.class_label,
                },
                components: components || []
            }
        });
    } catch (error) {
        console.error('Error in GET /marks/components/:classSubjectId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// PUT /api/academic/v1/marks/components/:componentId
// Update assessment component
// ============================================
router.put('/components/:componentId', async (req: Request, res: Response) => {
    try {
        const { componentId } = req.params;
        const { component_name, max_marks, weightage, component_type } = req.body;

        const updateData: Record<string, any> = {};
        if (component_name !== undefined) updateData.component_name = component_name;
        if (max_marks !== undefined) updateData.max_marks = max_marks;
        if (weightage !== undefined) updateData.weightage = weightage;
        if (component_type !== undefined) updateData.component_type = component_type;

        const { data, error } = await supabaseAdmin
            .from('assessment_components')
            .update(updateData)
            .eq('id', componentId)
            .select()
            .single();

        if (error) {
            console.error('Error updating component:', error);
            res.status(500).json({ success: false, message: 'Failed to update component' });
            return;
        }

        res.json({ success: true, message: 'Component updated', data });
    } catch (error) {
        console.error('Error in PUT /marks/components/:componentId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// DELETE /api/academic/v1/marks/components/:componentId
// Soft delete assessment component
// ============================================
router.delete('/components/:componentId', async (req: Request, res: Response) => {
    try {
        const { componentId } = req.params;

        const { error } = await supabaseAdmin
            .from('assessment_components')
            .update({ is_active: false })
            .eq('id', componentId);

        if (error) {
            console.error('Error deleting component:', error);
            res.status(500).json({ success: false, message: 'Failed to delete component' });
            return;
        }

        res.json({ success: true, message: 'Component deleted' });
    } catch (error) {
        console.error('Error in DELETE /marks/components/:componentId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// POST /api/academic/v1/marks
// Upload marks for students (bulk)
// ============================================
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            component_id,
            student_marks // [{ student_id, marks_obtained }]
        } = req.body;

        if (!component_id || !student_marks || !Array.isArray(student_marks)) {
            res.status(400).json({
                success: false,
                message: 'component_id and student_marks are required'
            });
            return;
        }

        // Get component to validate max marks
        const { data: component, error: compError } = await supabaseAdmin
            .from('assessment_components')
            .select('max_marks')
            .eq('id', component_id)
            .single();

        if (compError || !component) {
            res.status(404).json({ success: false, message: 'Component not found' });
            return;
        }

        // Validate marks
        const invalidMarks = student_marks.filter((m: any) => m.marks_obtained > component.max_marks);
        if (invalidMarks.length > 0) {
            res.status(400).json({
                success: false,
                message: `Marks cannot exceed max marks (${component.max_marks})`,
                invalid_entries: invalidMarks.length
            });
            return;
        }

        // Upsert marks (update if exists, insert if not)
        let successCount = 0;
        let errorCount = 0;

        for (const mark of student_marks) {
            // Check if mark exists
            const { data: existing } = await supabaseAdmin
                .from('student_marks')
                .select('id')
                .eq('component_id', component_id)
                .eq('student_id', mark.student_id)
                .single();

            if (existing) {
                // Update
                const { error } = await supabaseAdmin
                    .from('student_marks')
                    .update({
                        marks_obtained: mark.marks_obtained,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);

                if (error) errorCount++;
                else successCount++;
            } else {
                // Insert
                const { error } = await supabaseAdmin
                    .from('student_marks')
                    .insert({
                        component_id,
                        student_id: mark.student_id,
                        marks_obtained: mark.marks_obtained,
                    });

                if (error) errorCount++;
                else successCount++;
            }
        }

        res.status(201).json({
            success: true,
            message: 'Marks saved successfully',
            data: {
                total: student_marks.length,
                saved: successCount,
                errors: errorCount
            }
        });
    } catch (error) {
        console.error('Error in POST /marks:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/marks/component/:componentId
// Get marks for a specific component (for professor view)
// ============================================
router.get('/component/:componentId', async (req: Request, res: Response) => {
    try {
        const { componentId } = req.params;

        // Get component info
        const { data: component, error: compError } = await supabaseAdmin
            .from('assessment_components')
            .select(`
                id,
                component_name,
                max_marks,
                weightage,
                component_type,
                class_subjects (
                    id,
                    class_id,
                    subjects (subject_name, subject_code),
                    classes (class_label)
                )
            `)
            .eq('id', componentId)
            .single();

        if (compError || !component) {
            res.status(404).json({ success: false, message: 'Component not found' });
            return;
        }

        // Get all students in the class
        const { data: classStudents, error: csError } = await supabaseAdmin
            .from('class_students')
            .select(`
                student_id,
                student_profiles (
                    id,
                    roll_number,
                    users (full_name)
                )
            `)
            .eq('class_id', component.class_subjects?.class_id)
            .eq('is_active', true)
            .order('student_profiles(roll_number)');

        if (csError) {
            console.error('Error fetching students:', csError);
            res.status(500).json({ success: false, message: 'Failed to fetch students' });
            return;
        }

        // Get marks for this component
        const { data: marks, error: marksError } = await supabaseAdmin
            .from('student_marks')
            .select('student_id, marks_obtained, updated_at')
            .eq('component_id', componentId);

        if (marksError) {
            console.error('Error fetching marks:', marksError);
        }

        // Map marks to students
        const marksMap = new Map((marks || []).map((m: any) => [m.student_id, m]));

        const studentsWithMarks = (classStudents || []).map((s: any) => {
            const mark = marksMap.get(s.student_id);
            return {
                student_id: s.student_id,
                roll_number: s.student_profiles?.roll_number,
                full_name: s.student_profiles?.users?.full_name,
                marks_obtained: mark?.marks_obtained ?? null,
                last_updated: mark?.updated_at ?? null,
                status: mark ? 'saved' : 'pending',
            };
        });

        res.json({
            success: true,
            data: {
                component: {
                    id: component.id,
                    name: component.component_name,
                    max_marks: component.max_marks,
                    weightage: component.weightage,
                    type: component.component_type,
                },
                subject: {
                    name: component.class_subjects?.subjects?.subject_name,
                    code: component.class_subjects?.subjects?.subject_code,
                },
                class_label: component.class_subjects?.classes?.class_label,
                students: studentsWithMarks,
                summary: {
                    total_students: studentsWithMarks.length,
                    marked: studentsWithMarks.filter((s: any) => s.status === 'saved').length,
                    pending: studentsWithMarks.filter((s: any) => s.status === 'pending').length,
                }
            }
        });
    } catch (error) {
        console.error('Error in GET /marks/component/:componentId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// PUT /api/academic/v1/marks/:markId
// Update individual mark
// ============================================
router.put('/:markId', async (req: Request, res: Response) => {
    try {
        const { markId } = req.params;
        const { marks_obtained } = req.body;

        if (marks_obtained === undefined) {
            res.status(400).json({ success: false, message: 'marks_obtained is required' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('student_marks')
            .update({
                marks_obtained,
                updated_at: new Date().toISOString()
            })
            .eq('id', markId)
            .select()
            .single();

        if (error) {
            console.error('Error updating mark:', error);
            res.status(500).json({ success: false, message: 'Failed to update mark' });
            return;
        }

        res.json({ success: true, message: 'Mark updated', data });
    } catch (error) {
        console.error('Error in PUT /marks/:markId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/marks/my
// Get logged-in student's marks summary
// ============================================
router.get('/my', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        // Get student
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

        // Get class subjects
        const { data: classSubjects, error: csError } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                subjects (id, subject_name, subject_code),
                professor_profiles (users (full_name))
            `)
            .eq('class_id', enrollment.class_id)
            .eq('is_active', true);

        if (csError) {
            console.error('Error fetching class subjects:', csError);
            res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
            return;
        }

        // Get marks for each subject
        const marksBySubject = await Promise.all((classSubjects || []).map(async (cs: any) => {
            // Get components
            const { data: components } = await supabaseAdmin
                .from('assessment_components')
                .select('id, component_name, max_marks')
                .eq('class_subject_id', cs.id)
                .eq('is_active', true);

            // Get student's marks for these components
            const componentIds = (components || []).map((c: any) => c.id);
            const { data: marks } = await supabaseAdmin
                .from('student_marks')
                .select('component_id, marks_obtained')
                .eq('student_id', student.id)
                .in('component_id', componentIds.length > 0 ? componentIds : ['00000000-0000-0000-0000-000000000000']);

            const marksMap = new Map((marks || []).map((m: any) => [m.component_id, m.marks_obtained]));

            const componentsWithMarks = (components || []).map((c: any) => ({
                id: c.id,
                name: c.component_name,
                max_marks: c.max_marks,
                obtained: marksMap.get(c.id) ?? null,
                percentage: marksMap.has(c.id)
                    ? Math.round((marksMap.get(c.id)! / c.max_marks) * 100)
                    : null,
            }));

            const totalMax = componentsWithMarks.reduce((sum, c) => sum + c.max_marks, 0);
            const totalObtained = componentsWithMarks.reduce((sum, c) => sum + (c.obtained || 0), 0);

            return {
                class_subject_id: cs.id,
                subject_id: cs.subjects?.id,
                subject_name: cs.subjects?.subject_name,
                subject_code: cs.subjects?.subject_code,
                professor_name: cs.professor_profiles?.users?.full_name,
                components: componentsWithMarks,
                total_max: totalMax,
                total_obtained: totalObtained,
                percentage: totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null,
            };
        }));

        res.json({
            success: true,
            data: marksBySubject
        });
    } catch (error) {
        console.error('Error in GET /marks/my:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/marks/my/:classSubjectId
// Get student's detailed marks for a subject
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

        // Get class subject details
        const { data: classSubject } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                subjects (subject_name, subject_code),
                professor_profiles (users (full_name))
            `)
            .eq('id', classSubjectId)
            .single();

        if (!classSubject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        // Get all components and student's marks
        const { data: components } = await supabaseAdmin
            .from('assessment_components')
            .select(`
                id,
                component_name,
                max_marks,
                weightage,
                component_type,
                created_at
            `)
            .eq('class_subject_id', classSubjectId)
            .eq('is_active', true)
            .order('created_at');

        const componentIds = (components || []).map((c: any) => c.id);
        const { data: marks } = await supabaseAdmin
            .from('student_marks')
            .select('component_id, marks_obtained, updated_at')
            .eq('student_id', student.id)
            .in('component_id', componentIds.length > 0 ? componentIds : ['00000000-0000-0000-0000-000000000000']);

        const marksMap = new Map((marks || []).map((m: any) => [m.component_id, m]));

        const componentsWithMarks = (components || []).map((c: any) => {
            const mark = marksMap.get(c.id);
            return {
                id: c.id,
                name: c.component_name,
                type: c.component_type,
                max_marks: c.max_marks,
                weightage: c.weightage,
                obtained: mark?.marks_obtained ?? null,
                percentage: mark?.marks_obtained !== undefined
                    ? Math.round((mark.marks_obtained / c.max_marks) * 100)
                    : null,
                updated_at: mark?.updated_at ?? null,
            };
        });

        res.json({
            success: true,
            data: {
                subject_name: classSubject.subjects?.subject_name,
                subject_code: classSubject.subjects?.subject_code,
                professor_name: classSubject.professor_profiles?.users?.full_name,
                components: componentsWithMarks,
            }
        });
    } catch (error) {
        console.error('Error in GET /marks/my/:classSubjectId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/marks/class-subject/:classSubjectId
// Get all marks for a class-subject (Professor view)
// ============================================
router.get('/class-subject/:classSubjectId', async (req: Request, res: Response) => {
    try {
        const { classSubjectId } = req.params;

        // Get class subject
        const { data: classSubject, error: csError } = await supabaseAdmin
            .from('class_subjects')
            .select(`
                id,
                class_id,
                subjects (subject_name, subject_code),
                classes (class_label)
            `)
            .eq('id', classSubjectId)
            .single();

        if (csError || !classSubject) {
            res.status(404).json({ success: false, message: 'Class subject not found' });
            return;
        }

        // Get all components
        const { data: components, error: compError } = await supabaseAdmin
            .from('assessment_components')
            .select('id, component_name, max_marks, component_type')
            .eq('class_subject_id', classSubjectId)
            .eq('is_active', true)
            .order('created_at');

        if (compError) {
            console.error('Error fetching components:', compError);
        }

        // Get all students
        const { data: students, error: studentsError } = await supabaseAdmin
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
            .eq('is_active', true)
            .order('student_profiles(roll_number)');

        if (studentsError) {
            console.error('Error fetching students:', studentsError);
        }

        // Get all marks
        const componentIds = (components || []).map((c: any) => c.id);
        const { data: allMarks } = await supabaseAdmin
            .from('student_marks')
            .select('student_id, component_id, marks_obtained')
            .in('component_id', componentIds.length > 0 ? componentIds : ['00000000-0000-0000-0000-000000000000']);

        // Build marks table
        const marksTable = (students || []).map((s: any) => {
            const studentMarks: Record<string, number | null> = {};
            (components || []).forEach((c: any) => {
                const mark = (allMarks || []).find(
                    (m: any) => m.student_id === s.student_id && m.component_id === c.id
                );
                studentMarks[c.id] = mark?.marks_obtained ?? null;
            });

            return {
                student_id: s.student_id,
                roll_number: s.student_profiles?.roll_number,
                full_name: s.student_profiles?.users?.full_name,
                marks: studentMarks,
            };
        });

        res.json({
            success: true,
            data: {
                subject: {
                    name: classSubject.subjects?.subject_name,
                    code: classSubject.subjects?.subject_code,
                },
                class_label: classSubject.classes?.class_label,
                components: components || [],
                students: marksTable,
            }
        });
    } catch (error) {
        console.error('Error in GET /marks/class-subject/:classSubjectId:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
