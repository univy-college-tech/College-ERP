// Quick test with actual query used in API
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const userId = 'f84d32cf-e45a-4c46-85d5-944ac1b5f413';

    console.log('Testing actual query from API...\n');

    const { data: profile, error } = await supabase
        .from('professor_profiles')
        .select(`
            id,
            user_id,
            employee_id,
            department_id,
            designation,
            qualification,
            specialization,
            joined_date,
            experience_years,
            created_at,
            departments (
                id,
                department_name,
                department_code
            ),
            users (
                id,
                email,
                full_name,
                phone,
                role
            )
        `)
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Profile:', JSON.stringify(profile, null, 2));
    }
}

test().then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1)
});
