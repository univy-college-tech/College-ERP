import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

/**
 * GET /api/academic/v1/professor/profile
 * Get professor profile by user_id
 */
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required',
            });
        }

        // Fetch professor profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('professor_profiles')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (profileError) {
            if (profileError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Professor profile not found',
                });
            }
            console.error('Profile query error:', profileError);
            throw profileError;
        }

        // Fetch user details
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, phone, role')
            .eq('id', user_id)
            .single();

        if (userError) {
            console.error('User query error:', userError);
        }

        // Fetch department if exists
        let department = null;
        if (profile.department_id) {
            const { data: dept } = await supabaseAdmin
                .from('departments')
                .select('id, department_name, department_code')
                .eq('id', profile.department_id)
                .single();
            department = dept;
        }

        const transformedProfile = {
            id: profile.id,
            user_id: profile.user_id,
            employee_id: profile.employee_id,
            department_id: profile.department_id,
            department_name: department?.department_name || null,
            department_code: department?.department_code || null,
            designation: profile.designation,
            qualification: profile.qualification,
            specialization: profile.specialization,
            joining_date: profile.joined_date,
            employment_type: 'permanent', // Default since field doesn't exist
            experience_years: profile.experience_years,
            // User details
            email: user?.email,
            full_name: user?.full_name,
            phone: user?.phone,
            role: user?.role,
        };

        return res.json({
            success: true,
            data: transformedProfile,
        });
    } catch (error) {
        console.error('Error fetching professor profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch professor profile',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
