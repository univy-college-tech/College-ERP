
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- Diagnosing Student Data ---');

    // 1. List all users to find a student
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
        .limit(5);

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No student users found.');
        return;
    }

    console.log(`Found ${users.length} student users.`);

    for (const user of users) {
        console.log(`\nChecking User: ${user.full_name} (${user.id})`);

        // 2. Check Student Profile
        const { data: profile, error: profileError } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError || !profile) {
            console.log('  ❌ No Student Profile found');
            continue;
        }
        console.log(`  ✅ Student Profile: ${profile.id} (Roll: ${profile.roll_number})`);

        // 3. Check Enrollment
        const { data: enrollment, error: enrollError } = await supabase
            .from('class_students')
            .select('*, classes(class_label)')
            .eq('student_id', profile.id)
            .eq('is_active', true)
            .single();

        if (enrollError || !enrollment) {
            console.log('  ❌ No Active Enrollment found');
            continue;
        }
        console.log(`  ✅ Enrolled in Class: ${enrollment.classes?.class_label} (${enrollment.class_id})`);

        // 4. Check Class Subjects
        const { data: subjects, error: subjError } = await supabase
            .from('class_subjects')
            .select('id, subjects(subject_name)')
            .eq('class_id', enrollment.class_id)
            .eq('is_active', true);

        if (subjError || !subjects || subjects.length === 0) {
            console.log('  ❌ No Subjects found for this class');
            continue;
        }
        console.log(`  ✅ Found ${subjects.length} subjects`);

        // 5. Check Marks
        const { count: marksCount } = await supabase
            .from('student_marks')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', profile.id);

        console.log(`  ℹ️  Total Marks Records: ${marksCount}`);

        // 6. Check Attendance
        const { count: attendanceCount } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', profile.id);

        console.log(`  ℹ️  Total Attendance Records: ${attendanceCount}`);
    }
}

diagnose();
