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

async function testAPIData() {
    console.log('=== Testing API Endpoints Data ===\n');

    // Find a student with enrollment
    const { data: students } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'student');

    for (const student of students || []) {
        console.log(`\n--- Testing: ${student.full_name} ---`);

        // Get student profile
        const { data: profile } = await supabase
            .from('student_profiles')
            .select('id, roll_number')
            .eq('user_id', student.id)
            .single();

        if (!profile) {
            console.log('  ❌ No profile');
            continue;
        }

        // Get enrollment (simple - no joins to departments)
        const { data: enrollment } = await supabase
            .from('class_students')
            .select('class_id, classes (class_label)')
            .eq('student_id', profile.id)
            .eq('is_active', true)
            .single();

        if (!enrollment) {
            console.log('  ❌ No enrollment');
            continue;
        }

        console.log(`  ✅ Enrolled in: ${JSON.stringify(enrollment.classes)}`);

        // Get subjects
        const { data: subjects } = await supabase
            .from('class_subjects')
            .select('id, total_classes_conducted, subjects (id, subject_name, subject_code)')
            .eq('class_id', enrollment.class_id)
            .eq('is_active', true);

        console.log(`  ✅ Subjects: ${subjects?.length || 0}`);

        for (const cs of subjects || []) {
            const subjectInfo = Array.isArray(cs.subjects) ? cs.subjects[0] : cs.subjects;
            console.log(`\n     Subject: ${subjectInfo?.subject_name} (${cs.id})`);
            console.log(`     Total classes conducted: ${cs.total_classes_conducted || 0}`);

            // Check attendance
            const { data: attRecords, count: attCount } = await supabase
                .from('attendance_records')
                .select('status, session_id', { count: 'exact' })
                .eq('student_id', profile.id);

            // Filter for this subject's sessions
            if (attRecords && attRecords.length > 0) {
                const sessionIds = attRecords.map(r => r.session_id);
                const { data: sessions } = await supabase
                    .from('attendance_sessions')
                    .select('id')
                    .eq('class_subject_id', cs.id)
                    .in('id', sessionIds);
                console.log(`     Attendance sessions for this subject: ${sessions?.length || 0}`);
            } else {
                console.log(`     Total attendance records for student: ${attCount || 0}`);
            }

            // Check components
            const { data: components } = await supabase
                .from('assessment_components')
                .select('id, component_name, max_marks')
                .eq('class_subject_id', cs.id)
                .eq('is_active', true);

            console.log(`     Assessment components: ${components?.length || 0}`);

            for (const comp of components || []) {
                // Check marks
                const { data: marks } = await supabase
                    .from('student_marks')
                    .select('marks_obtained')
                    .eq('student_id', profile.id)
                    .eq('assessment_component_id', comp.id)
                    .single();

                console.log(`       - ${comp.component_name}: ${marks?.marks_obtained ?? 'No marks'} / ${comp.max_marks}`);
            }
        }

        // Only test first enrolled student
        break;
    }
}

testAPIData().catch(console.error);
