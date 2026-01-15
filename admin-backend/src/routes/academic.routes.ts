// ============================================
// Admin Backend - Academic Routes
// ============================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const createBatchSchema = z.object({
    batch_name: z.string().min(1),
    batch_year: z.number().min(2000).max(2100),
});

const createCourseSchema = z.object({
    course_name: z.string().min(1),
    course_code: z.string().min(1),
    duration_years: z.number().min(1).max(6).default(4),
    total_semesters: z.number().min(1).max(12).default(8),
});

const createBranchSchema = z.object({
    branch_name: z.string().min(1),
    branch_code: z.string().min(1),
    course_id: z.string().uuid(),
});

const createClassSchema = z.object({
    class_name: z.string().min(1),
    section: z.string().min(1).max(2),
    current_semester: z.number().min(1).max(12).default(1),
    batch_id: z.string().uuid(),
    branch_id: z.string().uuid(),
});

// ============================================
// BATCHES ROUTES
// ============================================

// GET /api/admin/v1/academic/batches
router.get('/batches', async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabaseAdmin
            .from('batches')
            .select('*')
            .order('batch_year', { ascending: false });

        if (error) {
            console.error('Error fetching batches:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch batches' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in GET /batches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /api/admin/v1/academic/batches/:id
router.get('/batches/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('batches')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ success: false, message: 'Batch not found' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in GET /batches/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/admin/v1/academic/batches
router.post('/batches', async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createBatchSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, message: 'Invalid data', errors: validation.error.errors });
            return;
        }

        const { batch_name, batch_year } = validation.data;

        const { data, error } = await supabaseAdmin
            .from('batches')
            .insert({
                batch_name,
                batch_year,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating batch:', error);
            res.status(500).json({ success: false, message: 'Failed to create batch' });
            return;
        }

        res.status(201).json({ success: true, message: 'Batch created', data });
    } catch (error) {
        console.error('Error in POST /batches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// COURSES ROUTES
// ============================================

// GET /api/admin/v1/academic/courses
router.get('/courses', async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabaseAdmin
            .from('courses')
            .select('*')
            .eq('is_active', true)
            .order('course_name');

        if (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch courses' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in GET /courses:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/admin/v1/academic/courses
router.post('/courses', async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createCourseSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, message: 'Invalid data', errors: validation.error.errors });
            return;
        }

        const { course_name, course_code, duration_years, total_semesters } = validation.data;

        // Check if course_code exists
        const { data: existing } = await supabaseAdmin
            .from('courses')
            .select('id')
            .eq('course_code', course_code)
            .single();

        if (existing) {
            res.status(400).json({ success: false, message: 'Course code already exists' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('courses')
            .insert({
                course_name,
                course_code,
                duration_years,
                total_semesters,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating course:', error);
            res.status(500).json({ success: false, message: 'Failed to create course' });
            return;
        }

        res.status(201).json({ success: true, message: 'Course created', data });
    } catch (error) {
        console.error('Error in POST /courses:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /api/admin/v1/academic/courses/:id
router.get('/courses/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in GET /courses/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// PUT /api/admin/v1/academic/courses/:id
router.put('/courses/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { course_name, course_code, duration_years, total_semesters, is_active } = req.body;

        // Check if course exists
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('courses')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }

        // Build update object
        const updateData: Record<string, any> = {};
        if (course_name !== undefined) updateData.course_name = course_name;
        if (course_code !== undefined) updateData.course_code = course_code;
        if (duration_years !== undefined) updateData.duration_years = duration_years;
        if (total_semesters !== undefined) updateData.total_semesters = total_semesters;
        if (is_active !== undefined) updateData.is_active = is_active;

        const { data, error } = await supabaseAdmin
            .from('courses')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating course:', error);
            res.status(500).json({ success: false, message: 'Failed to update course' });
            return;
        }

        res.json({ success: true, message: 'Course updated', data });
    } catch (error) {
        console.error('Error in PUT /courses/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE /api/admin/v1/academic/courses/:id
router.delete('/courses/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Soft delete: set is_active to false
        const { error } = await supabaseAdmin
            .from('courses')
            .update({
                is_active: false,
            })
            .eq('id', id);

        if (error) {
            console.error('Error deleting course:', error);
            res.status(500).json({ success: false, message: 'Failed to delete course' });
            return;
        }

        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /courses/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// BRANCHES ROUTES
// ============================================

// GET /api/admin/v1/academic/branches
router.get('/branches', async (req: Request, res: Response): Promise<void> => {
    try {
        const { course_id } = req.query;

        let query = supabaseAdmin
            .from('branches')
            .select('*')
            .eq('is_active', true)
            .order('branch_name');

        if (course_id) {
            query = query.eq('course_id', course_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching branches:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch branches' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in GET /branches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/admin/v1/academic/branches
router.post('/branches', async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createBranchSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, message: 'Invalid data', errors: validation.error.errors });
            return;
        }

        const { branch_name, branch_code, course_id } = validation.data;

        // Check if branch_code exists for this course
        const { data: existing } = await supabaseAdmin
            .from('branches')
            .select('id')
            .eq('branch_code', branch_code)
            .eq('course_id', course_id)
            .single();

        if (existing) {
            res.status(400).json({ success: false, message: 'Branch code already exists for this course' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('branches')
            .insert({
                branch_name,
                branch_code,
                course_id,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating branch:', error);
            res.status(500).json({ success: false, message: 'Failed to create branch' });
            return;
        }

        res.status(201).json({ success: true, message: 'Branch created', data });
    } catch (error) {
        console.error('Error in POST /branches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// CLASSES ROUTES
// ============================================

// GET /api/admin/v1/academic/classes
router.get('/classes', async (req: Request, res: Response): Promise<void> => {
    try {
        const { batch_id, branch_id } = req.query;

        let query = supabaseAdmin
            .from('classes')
            .select(`
        *,
        batches(id, batch_name),
        branches(id, branch_name, branch_code)
      `)
            .order('class_name');

        if (batch_id) query = query.eq('batch_id', batch_id);
        if (branch_id) query = query.eq('branch_id', branch_id);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching classes:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch classes' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in GET /classes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /api/admin/v1/academic/classes/:id
router.get('/classes/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('classes')
            .select(`
        *,
        batches(id, batch_name, batch_year),
        branches(id, branch_name, branch_code, course_id),
        class_incharge:class_incharge_id(id, users(full_name)),
        class_representative:class_representative_id(id, users(full_name))
      `)
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in GET /classes/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/admin/v1/academic/classes
router.post('/classes', async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createClassSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, message: 'Invalid data', errors: validation.error.errors });
            return;
        }

        const { class_name, section, current_semester, batch_id, branch_id } = validation.data;

        // Check if class exists
        const { data: existing } = await supabaseAdmin
            .from('classes')
            .select('id')
            .eq('batch_id', batch_id)
            .eq('branch_id', branch_id)
            .eq('section', section)
            .single();

        if (existing) {
            res.status(400).json({ success: false, message: 'Section already exists for this batch and branch' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('classes')
            .insert({
                class_name,
                section,
                current_semester,
                batch_id,
                branch_id,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating class:', error);
            res.status(500).json({ success: false, message: 'Failed to create class' });
            return;
        }

        res.status(201).json({ success: true, message: 'Class created', data });
    } catch (error) {
        console.error('Error in POST /classes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// PUT /api/admin/v1/academic/classes/:id
router.put('/classes/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { current_semester, class_incharge_id, class_representative_id } = req.body;

        const updateData: Record<string, any> = {};
        if (current_semester !== undefined) updateData.current_semester = current_semester;
        if (class_incharge_id !== undefined) updateData.class_incharge_id = class_incharge_id || null;
        if (class_representative_id !== undefined) updateData.class_representative_id = class_representative_id || null;

        const { data, error } = await supabaseAdmin
            .from('classes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating class:', error);
            res.status(500).json({ success: false, message: 'Failed to update class' });
            return;
        }

        res.json({ success: true, message: 'Class updated', data });
    } catch (error) {
        console.error('Error in PUT /classes/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
