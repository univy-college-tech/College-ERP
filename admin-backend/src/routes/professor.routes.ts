// ============================================
// Admin Backend - Professor Routes
// ============================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const createProfessorSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional().transform(v => v || undefined),
    employee_id: z.string().min(1, 'Employee ID is required'),
    department_id: z.union([
        z.string().uuid(),
        z.literal('').transform(() => undefined)
    ]).optional(),
    designation: z.string().optional().transform(v => v || undefined),
    specialization: z.string().optional().transform(v => v || undefined),
    qualification: z.string().optional().transform(v => v || undefined),
    joined_date: z.string().optional().transform(v => v || undefined),
});

const updateProfessorSchema = createProfessorSchema.partial().omit({ email: true, employee_id: true });

// ============================================
// GET /api/admin/v1/professors - List all professors
// ============================================
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, department, status, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        let query = supabaseAdmin
            .from('professor_profiles')
            .select(`
        id,
        user_id,
        employee_id,
        designation,
        specialization,
        qualification,
        joined_date,
        department_id,
        created_at,
        users!inner(id, full_name, email, phone, is_active),
        departments!professor_profiles_department_id_fkey(id, department_name, department_code)
      `, { count: 'exact' });

        // Apply search filter
        if (search) {
            query = query.or(`employee_id.ilike.%${search}%,users.full_name.ilike.%${search}%,users.email.ilike.%${search}%`);
        }

        // Apply department filter
        if (department) {
            query = query.eq('department_id', department);
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
            console.error('Error fetching professors:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch professors' });
            return;
        }

        // Map the data
        const professors = (data || []).map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            employee_id: p.employee_id,
            full_name: p.users?.full_name || '',
            email: p.users?.email || '',
            phone: p.users?.phone || null,
            department_id: p.department_id,
            department_name: p.departments?.department_name || null,
            department_code: p.departments?.department_code || null,
            designation: p.designation,
            specialization: p.specialization,
            qualification: p.qualification,
            joined_date: p.joined_date,
            is_active: p.users?.is_active ?? true,
            created_at: p.created_at,
        }));

        res.json({
            success: true,
            data: professors,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limitNum),
            },
        });
    } catch (error) {
        console.error('Error in GET /professors:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/admin/v1/professors/:id - Get professor by ID
// ============================================
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('professor_profiles')
            .select(`
        *,
        users!inner(*),
        departments(*)
      `)
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ success: false, message: 'Professor not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: data.id,
                user_id: data.user_id,
                employee_id: data.employee_id,
                full_name: data.users?.full_name,
                email: data.users?.email,
                phone: data.users?.phone,
                department_id: data.department_id,
                department: data.departments,
                designation: data.designation,
                specialization: data.specialization,
                qualification: data.qualification,
                joined_date: data.joined_date,
                experience_years: data.experience_years,
                is_active: data.users?.is_active,
            },
        });
    } catch (error) {
        console.error('Error in GET /professors/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// POST /api/admin/v1/professors - Create professor
// ============================================
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validation = createProfessorSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.errors,
            });
            return;
        }

        const { full_name, email, password, phone, employee_id, department_id, designation, specialization, qualification, joined_date } = validation.data;

        // Generate default password if not provided
        const userPassword = password || `Prof@${employee_id}`;

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

        // Check if employee_id already exists
        const { data: existingEmployee } = await supabaseAdmin
            .from('professor_profiles')
            .select('id')
            .eq('employee_id', employee_id)
            .single();

        if (existingEmployee) {
            res.status(400).json({ success: false, message: 'Employee ID already exists' });
            return;
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: userPassword,
            email_confirm: true,
            user_metadata: { full_name, role: 'professor' },
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
            role: 'professor',
            is_active: true,
        });

        if (userError) {
            // Rollback: delete auth user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.error('Error creating user record:', userError);
            res.status(500).json({ success: false, message: 'Failed to create user profile' });
            return;
        }

        // Create professor profile
        const { data: professor, error: profileError } = await supabaseAdmin
            .from('professor_profiles')
            .insert({
                user_id: authData.user.id,
                employee_id,
                department_id: department_id || null,
                designation,
                specialization,
                qualification,
                joined_date: joined_date || null,
            })
            .select()
            .single();

        if (profileError) {
            // Rollback: delete user and auth
            await supabaseAdmin.from('users').delete().eq('id', authData.user.id);
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.error('Error creating professor profile:', profileError);
            res.status(500).json({ success: false, message: 'Failed to create professor profile' });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Professor created successfully',
            data: {
                id: professor.id,
                user_id: authData.user.id,
                employee_id,
                full_name,
                email,
                password: userPassword, // Return the password (custom or default)
            },
        });
    } catch (error) {
        console.error('Error in POST /professors:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// PUT /api/admin/v1/professors/:id - Update professor
// ============================================
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Validate input
        const validation = updateProfessorSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.errors,
            });
            return;
        }

        // Get existing professor
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('professor_profiles')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            res.status(404).json({ success: false, message: 'Professor not found' });
            return;
        }

        const { full_name, phone, department_id, designation, specialization, qualification, joined_date } = validation.data;

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

        // Update professor profile
        const updateData: Record<string, any> = {};
        if (department_id !== undefined) updateData.department_id = department_id || null;
        if (designation !== undefined) updateData.designation = designation || null;
        if (specialization !== undefined) updateData.specialization = specialization || null;
        if (qualification !== undefined) updateData.qualification = qualification || null;
        if (joined_date !== undefined) updateData.joined_date = joined_date || null;

        // Update professor profile only if there are actual fields to update
        let professor = null;
        if (Object.keys(updateData).length > 0) {
            const { data, error: profileError } = await supabaseAdmin
                .from('professor_profiles')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (profileError) {
                console.error('Error updating professor:', profileError);
                res.status(500).json({ success: false, message: 'Failed to update professor' });
                return;
            }
            professor = data;
        } else {
            // No profile fields to update, just fetch current data
            const { data } = await supabaseAdmin
                .from('professor_profiles')
                .select()
                .eq('id', id)
                .single();
            professor = data;
        }

        res.json({
            success: true,
            message: 'Professor updated successfully',
            data: professor,
        });
    } catch (error) {
        console.error('Error in PUT /professors/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// DELETE /api/admin/v1/professors/:id - Soft delete
// ============================================
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get professor's user_id
        const { data: professor, error: fetchError } = await supabaseAdmin
            .from('professor_profiles')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !professor) {
            res.status(404).json({ success: false, message: 'Professor not found' });
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
            .eq('id', professor.user_id);

        if (deleteError) {
            console.error('Error deleting professor:', deleteError);
            res.status(500).json({ success: false, message: 'Failed to delete professor' });
            return;
        }

        res.json({
            success: true,
            message: 'Professor deleted successfully',
        });
    } catch (error) {
        console.error('Error in DELETE /professors/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
