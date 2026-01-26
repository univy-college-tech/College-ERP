
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

/**
 * GET /api/academic/v1/student/profile
 * Get student profile by user_id
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

        // 1. Fetch student profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('student_profiles')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (profileError) {
            if (profileError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Student profile not found',
                });
            }
            console.error('Profile query error:', profileError);
            throw profileError;
        }

        // 2. Fetch user details
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, phone, role')
            .eq('id', user_id)
            .single();

        if (userError) {
            console.error('User query error:', userError);
        }

        // 3. Fetch enrollment (active class)
        const { data: enrollment, error: enrollError } = await supabaseAdmin
            .from('class_students')
            .select(`
                class_id,
                joined_on,
                classes (
                    class_label,
                    batch_id,
                    branch_id,
                    section_id,
                    semester_id
                )
            `)
            .eq('student_id', profile.id)
            .eq('is_active', true)
            .single();

        if (enrollError && enrollError.code !== 'PGRST116') {
            console.error('Enrollment query error:', enrollError);
        }

        // Handle Supabase nested objects
        const classData = enrollment?.classes;
        const classInfo = Array.isArray(classData) ? classData[0] : classData;

        // 4. Get branch (department) info
        let branchName = null;
        let branchCode = null;
        if (classInfo?.branch_id) {
            const { data: branch } = await supabaseAdmin
                .from('branches')
                .select('branch_name, branch_code')
                .eq('id', classInfo.branch_id)
                .single();
            branchName = branch?.branch_name;
            branchCode = branch?.branch_code;
        }

        // 5. Get batch info
        let batchName = null;
        let batchYear = null;
        if (classInfo?.batch_id) {
            const { data: batch } = await supabaseAdmin
                .from('batches')
                .select('batch_name, batch_year')
                .eq('id', classInfo.batch_id)
                .single();
            batchName = batch?.batch_name;
            batchYear = batch?.batch_year;
        }

        // 6. Get semester info
        let semesterNumber = null;
        if (classInfo?.semester_id) {
            const { data: semester } = await supabaseAdmin
                .from('semesters')
                .select('semester_number, semester_type')
                .eq('id', classInfo.semester_id)
                .single();
            semesterNumber = semester?.semester_number;
        }

        // 7. Get guardian info from separate table
        const { data: guardian } = await supabaseAdmin
            .from('guardians')
            .select('*')
            .eq('student_id', profile.id)
            .limit(1)
            .single();

        // 8. Get address if exists
        const { data: userAddress } = await supabaseAdmin
            .from('user_addresses')
            .select(`
                address_type,
                addresses (
                    address_line1,
                    address_line2,
                    city,
                    state,
                    pincode
                )
            `)
            .eq('user_id', user_id)
            .eq('is_primary', true)
            .single();

        const addressData = userAddress?.addresses;
        const addressInfo = Array.isArray(addressData) ? addressData[0] : addressData;

        const transformedProfile = {
            id: profile.id,
            user_id: profile.user_id,
            roll_number: profile.roll_number,
            enrollment_number: profile.enrollment_number,
            gender: profile.gender,
            date_of_birth: profile.date_of_birth,
            blood_group: profile.blood_group,
            category: profile.category,
            is_hosteller: profile.is_hosteller,
            admission_year: profile.admission_year,

            // Class Info
            class_id: enrollment?.class_id || null,
            class_label: classInfo?.class_label || null,
            enrolled_on: enrollment?.joined_on || null,
            semester: semesterNumber,

            // Department/Branch Info
            department: branchName,
            department_code: branchCode,

            // Batch/Academic Year Info
            academic_year: batchName,
            batch_year: batchYear,

            // Guardian Info (from separate table)
            guardian_name: guardian?.guardian_name || null,
            guardian_phone: guardian?.phone || null,
            guardian_email: guardian?.email || null,
            guardian_relationship: guardian?.relationship || null,

            // Address Info
            address: addressInfo ?
                `${addressInfo.address_line1}${addressInfo.address_line2 ? ', ' + addressInfo.address_line2 : ''}, ${addressInfo.city}, ${addressInfo.state} - ${addressInfo.pincode}` :
                null,

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
        console.error('Error fetching student profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student profile',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
