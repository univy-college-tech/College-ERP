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

async function checkSchema() {
    console.log('=== Checking Database Schema ===\n');

    // Check classes table structure
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .limit(1);

    if (classError) {
        console.log('Classes table error:', classError.message);
    } else {
        console.log('Classes table columns:', classData?.[0] ? Object.keys(classData[0]) : 'No data');
    }

    // Check class_students table
    const { data: csData, error: csError } = await supabase
        .from('class_students')
        .select('*')
        .limit(1);

    if (csError) {
        console.log('class_students table error:', csError.message);
    } else {
        console.log('class_students columns:', csData?.[0] ? Object.keys(csData[0]) : 'No data');
    }

    // Check student_profiles table
    const { data: spData, error: spError } = await supabase
        .from('student_profiles')
        .select('*')
        .limit(1);

    if (spError) {
        console.log('student_profiles table error:', spError.message);
    } else {
        console.log('student_profiles columns:', spData?.[0] ? Object.keys(spData[0]) : 'No data');
    }

    // Try simple enrollment query
    console.log('\n=== Testing Simple Enrollment Query ===');
    const { data: enrollment, error: enrollError } = await supabase
        .from('class_students')
        .select(`
            class_id,
            is_active,
            classes (class_label)
        `)
        .eq('is_active', true)
        .limit(1);

    if (enrollError) {
        console.log('Enrollment query error:', enrollError.message);
    } else {
        console.log('Enrollment data:', JSON.stringify(enrollment, null, 2));
    }

    // Try to get class with its fields
    console.log('\n=== Testing Class Query ===');
    const { data: classInfo, error: classInfoError } = await supabase
        .from('classes')
        .select('*')
        .limit(1);

    if (classInfoError) {
        console.log('Class info error:', classInfoError.message);
    } else {
        console.log('Class data:', JSON.stringify(classInfo, null, 2));
    }
}

checkSchema().catch(console.error);
