import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStudentData() {
    console.log('=== Testing Student API Data ===\n');

    // 1. Find a student with enrollment
    const { data: students } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'student')
        .limit(5);

    console.log('Students found:', students?.length || 0);

    for (const student of students || []) {
        console.log(`\n--- Testing: ${student.full_name} (${student.id}) ---`);

        // Get student profile
        const { data: profile } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', student.id)
            .single();

        if (!profile) {
            console.log('  ❌ No student profile');
            continue;
        }
        console.log(`  ✅ Student Profile ID: ${profile.id}, Roll: ${profile.roll_number}`);

        // Get enrollment
        const { data: enrollment, error: enrollError } = await supabase
            .from('class_students')
            .select(`
                class_id,
                is_active,
                classes (
                    class_label,
                    departments (department_name)
                )
            `)
            .eq('student_id', profile.id)
            .eq('is_active', true)
            .single();

        if (enrollError || !enrollment) {
            console.log(`  ❌ No active enrollment: ${enrollError?.message || 'null'}`);
            continue;
        }

        const classInfo = Array.isArray(enrollment.classes) ? enrollment.classes[0] : enrollment.classes;
        console.log(`  ✅ Enrolled in: ${classInfo?.class_label} (${enrollment.class_id})`);

        // Get class subjects
        const { data: subjects, error: subjectsError } = await supabase
            .from('class_subjects')
            .select(`
                id,
                total_classes_conducted,
                subjects (id, subject_name, subject_code),
                professor_profiles (users (full_name))
            `)
            .eq('class_id', enrollment.class_id)
            .eq('is_active', true);

        if (subjectsError) {
            console.log(`  ❌ Error fetching subjects: ${subjectsError.message}`);
        } else {
            console.log(`  ✅ Subjects in class: ${subjects?.length || 0}`);

            for (const cs of subjects || []) {
                const subjectData = Array.isArray(cs.subjects) ? cs.subjects[0] : cs.subjects;
                console.log(`     - ${subjectData?.subject_name} (${cs.id})`);

                // Check attendance records for this subject
                const { data: attendanceRecords, count: attCount } = await supabase
                    .from('attendance_records')
                    .select('status, attendance_sessions!inner(class_subject_id)', { count: 'exact' })
                    .eq('student_id', profile.id)
                    .eq('attendance_sessions.class_subject_id', cs.id);

                // Check assessment components
                const { data: components } = await supabase
                    .from('assessment_components')
                    .select('id, component_name, max_marks')
                    .eq('class_subject_id', cs.id)
                    .eq('is_active', true);

                console.log(`       Attendance records: ${attCount || 0}, Components: ${components?.length || 0}`);

                // Check marks
                if (components && components.length > 0) {
                    const componentIds = components.map(c => c.id);
                    const { data: marks, count: marksCount } = await supabase
                        .from('student_marks')
                        .select('*', { count: 'exact' })
                        .eq('student_id', profile.id)
                        .in('assessment_component_id', componentIds);
                    console.log(`       Marks entered: ${marksCount || 0}`);
                }

                // Check attendance sessions
                const { data: sessions, count: sessionCount } = await supabase
                    .from('attendance_sessions')
                    .select('id, conducted_date', { count: 'exact' })
                    .eq('class_subject_id', cs.id);
                console.log(`       Attendance sessions: ${sessionCount || 0}`);
            }
        }

        // Only test first student with enrollment
        break;
    }
}

testStudentData().catch(console.error);
