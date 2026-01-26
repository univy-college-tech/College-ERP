import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkComponents() {
    console.log('=== Checking Assessment Components ===\n');

    // 1. Check all assessment components
    const { data: allComponents, error: compError } = await supabase
        .from('assessment_components')
        .select('*');

    console.log('All assessment components:', allComponents?.length || 0);
    if (compError) console.log('Error:', compError);
    console.log(JSON.stringify(allComponents, null, 2));

    // 2. Check specific class_subject_id
    const classSubjectId = 'b9b57105-5cd0-48b8-a5c6-9ca0f71a56b6';
    const { data: subjectComponents } = await supabase
        .from('assessment_components')
        .select('*')
        .eq('class_subject_id', classSubjectId);

    console.log(`\nComponents for class_subject ${classSubjectId}:`, subjectComponents?.length || 0);
    console.log(JSON.stringify(subjectComponents, null, 2));

    // 3. Check all class_subjects to find the right one
    const { data: classSubjects } = await supabase
        .from('class_subjects')
        .select(`
            id,
            class_id,
            subjects (subject_name, subject_code),
            classes (class_label)
        `);

    console.log('\nAll class_subjects:');
    for (const cs of classSubjects || []) {
        const subj = Array.isArray(cs.subjects) ? cs.subjects[0] : cs.subjects;
        const cls = Array.isArray(cs.classes) ? cs.classes[0] : cs.classes;
        console.log(`  - ${cs.id}: ${cls?.class_label} / ${subj?.subject_name}`);
    }

    // 4. Check student_marks
    const { data: marks } = await supabase
        .from('student_marks')
        .select('*');

    console.log('\nAll student_marks:', marks?.length || 0);
    console.log(JSON.stringify(marks, null, 2));
}

checkComponents();
