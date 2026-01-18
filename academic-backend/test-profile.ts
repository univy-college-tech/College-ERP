// Quick test script to check if professor profile exists
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const userId = 'f84d32cf-e45a-4c46-85d5-944ac1b5f413';

    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('User ID:', userId);

    // Test 1: Check if user exists
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single();

    console.log('\n--- User Query ---');
    if (userError) {
        console.error('User Error:', userError);
    } else {
        console.log('User found:', user);
    }

    // Test 2: Check if professor profile exists
    const { data: profile, error: profileError } = await supabase
        .from('professor_profiles')
        .select('*')
        .eq('user_id', userId);

    console.log('\n--- Professor Profile Query ---');
    if (profileError) {
        console.error('Profile Error:', profileError);
    } else {
        console.log('Profiles found:', profile);
        console.log('Count:', profile?.length || 0);
    }
}

test().then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
