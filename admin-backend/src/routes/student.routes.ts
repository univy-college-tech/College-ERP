// ============================================
// Admin Backend - Student Routes
// ============================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const createStudentSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional().transform(v => v || undefined),
    roll_number: z.string().min(1, 'Roll number is required'),
    enrollment_number: z.string().optional().transform(v => v || undefined),
    admission_year: z.number().min(2000).max(2100),
    gender: z.union([
        z.enum(['male', 'female', 'other']),
        z.literal('').transform(() => undefined)
    ]).optional(),
    date_of_birth: z.string().optional().transform(v => v || undefined),
    department_id: z.union([
        z.string().uuid(),
        z.literal('').transform(() => undefined)
    ]).optional(),
});

const updateStudentSchema = createStudentSchema.partial().omit({ email: true, roll_number: true });

// ============================================
// GET /api/admin/v1/students - List all students
// ============================================
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, batch, status, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        let query = supabaseAdmin
            .from('student_profiles')
            .select(`
        id,
        user_id,
        roll_number,
        enrollment_number,
        admission_year,
        gender,
        date_of_birth,
        department_id,
        created_at,
        users!inner(id, full_name, email, phone, is_active),
        departments:department_id(id, department_name, department_code)
      `, { count: 'exact' });

        // Apply search filter
        if (search) {
            query = query.or(`roll_number.ilike.%${search}%,users.full_name.ilike.%${search}%,users.email.ilike.%${search}%`);
        }

        // Apply batch/year filter
        if (batch) {
            query = query.eq('admission_year', parseInt(batch as string));
        }

        // Apply status filter
        if (status === 'active') {
            query = query.eq('users.is_active', true);
        } else if (status === 'inactive') {
            query = query.eq('users.is_active', false);
        }

        // Apply pagination
        query = query.range(offset, offset + limitNum - 1).order('created_at', { ascending: false });

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch students' });
            return;
        }

        // Map the data
        const students = (data || []).map((s: any) => ({
            id: s.id,
            user_id: s.user_id,
            roll_number: s.roll_number,
            enrollment_number: s.enrollment_number,
            full_name: s.users?.full_name || '',
            email: s.users?.email || '',
            phone: s.users?.phone || null,
            department_id: s.department_id,
            department_name: s.departments?.department_name || null,
            admission_year: s.admission_year,
            gender: s.gender,
            date_of_birth: s.date_of_birth,
            is_active: s.users?.is_active ?? true,
            created_at: s.created_at,
        }));

        res.json({
            success: true,
            data: students,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limitNum),
            },
        });
    } catch (error) {
        console.error('Error in GET /students:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/admin/v1/students/:id - Get student by ID
// ============================================
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('student_profiles')
            .select(`
        *,
        users!inner(*),
        departments:department_id(*)
      `)
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ success: false, message: 'Student not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: data.id,
                user_id: data.user_id,
                roll_number: data.roll_number,
                enrollment_number: data.enrollment_number,
                full_name: data.users?.full_name,
                email: data.users?.email,
                phone: data.users?.phone,
                department_id: data.department_id,
                department: data.departments,
                admission_year: data.admission_year,
                gender: data.gender,
                date_of_birth: data.date_of_birth,
                is_active: data.users?.is_active,
            },
        });
    } catch (error) {
        console.error('Error in GET /students/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// POST /api/admin/v1/students - Create student
// ============================================
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validation = createStudentSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.errors,
            });
            return;
        }

        const { full_name, email, password, phone, roll_number, enrollment_number, admission_year, gender, date_of_birth, department_id } = validation.data;

        // Generate default password if not provided
        const userPassword = password || `Student@${roll_number}`;

        // Check if email already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already exists' });
            return;
        }

        // Check if roll_number already exists
        const { data: existingRoll } = await supabaseAdmin
            .from('student_profiles')
            .select('id')
            .eq('roll_number', roll_number)
            .single();

        if (existingRoll) {
            res.status(400).json({ success: false, message: 'Roll number already exists' });
            return;
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: userPassword,
            email_confirm: true,
            user_metadata: { full_name, role: 'student' },
        });

        if (authError || !authData.user) {
            console.error('Error creating auth user:', authError);
            res.status(500).json({ success: false, message: 'Failed to create user account' });
            return;
        }

        // Create user record
        const { error: userError } = await supabaseAdmin.from('users').insert({
            id: authData.user.id,
            email,
            full_name,
            phone,
            role: 'student',
            is_active: true,
        });

        if (userError) {
            // Rollback: delete auth user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.error('Error creating user record:', userError);
            res.status(500).json({ success: false, message: 'Failed to create user profile' });
            return;
        }

        // Create student profile
        const { data: student, error: profileError } = await supabaseAdmin
            .from('student_profiles')
            .insert({
                user_id: authData.user.id,
                roll_number,
                enrollment_number: enrollment_number || null,
                admission_year,
                gender: gender || null,
                date_of_birth: date_of_birth || null,
                department_id: department_id || null,
            })
            .select()
            .single();

        if (profileError) {
            // Rollback: delete user and auth
            await supabaseAdmin.from('users').delete().eq('id', authData.user.id);
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.error('Error creating student profile:', profileError);
            res.status(500).json({ success: false, message: 'Failed to create student profile' });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: {
                id: student.id,
                user_id: authData.user.id,
                roll_number,
                full_name,
                email,
                password: userPassword, // Return the password (custom or default)
            },
        });
    } catch (error) {
        console.error('Error in POST /students:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// PUT /api/admin/v1/students/:id - Update student
// ============================================
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Validate input
        const validation = updateStudentSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.errors,
            });
            return;
        }

        // Get existing student
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('student_profiles')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            res.status(404).json({ success: false, message: 'Student not found' });
            return;
        }

        const { full_name, phone, enrollment_number, admission_year, gender, date_of_birth, department_id } = validation.data;

        // Update user record
        if (full_name || phone !== undefined) {
            const { error: userError } = await supabaseAdmin
                .from('users')
                .update({
                    ...(full_name && { full_name }),
                    ...(phone !== undefined && { phone }),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.user_id);

            if (userError) {
                console.error('Error updating user:', userError);
                res.status(500).json({ success: false, message: 'Failed to update user' });
                return;
            }
        }

        // Update student profile
        const updateData: Record<string, any> = {};
        if (enrollment_number !== undefined) updateData.enrollment_number = enrollment_number || null;
        if (admission_year !== undefined) updateData.admission_year = admission_year;
        if (gender !== undefined) updateData.gender = gender || null;
        if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth || null;
        if (department_id !== undefined) updateData.department_id = department_id || null;

        // Update student profile only if there are actual fields to update
        let student = null;
        if (Object.keys(updateData).length > 0) {
            const { data, error: profileError } = await supabaseAdmin
                .from('student_profiles')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (profileError) {
                console.error('Error updating student:', profileError);
                res.status(500).json({ success: false, message: 'Failed to update student' });
                return;
            }
            student = data;
        } else {
            // No profile fields to update, just fetch current data
            const { data } = await supabaseAdmin
                .from('student_profiles')
                .select()
                .eq('id', id)
                .single();
            student = data;
        }

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: student,
        });
    } catch (error) {
        console.error('Error in PUT /students/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// DELETE /api/admin/v1/students/:id - Soft delete
// ============================================
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get student's user_id
        const { data: student, error: fetchError } = await supabaseAdmin
            .from('student_profiles')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !student) {
            res.status(404).json({ success: false, message: 'Student not found' });
            return;
        }

        // Soft delete: set is_active to false
        const { error: deleteError } = await supabaseAdmin
            .from('users')
            .update({
                is_active: false,
                is_deleted: true,
                deleted_at: new Date().toISOString(),
            })
            .eq('id', student.user_id);

        if (deleteError) {
            console.error('Error deleting student:', deleteError);
            res.status(500).json({ success: false, message: 'Failed to delete student' });
            return;
        }

        res.json({
            success: true,
            message: 'Student deleted successfully',
        });
    } catch (error) {
        console.error('Error in DELETE /students/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
