import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    // Get the session IDs from attendance records
    const sessionIds = ['671a5bb4-82fc-44d2-96b0-aaa76e2cc601', '0bad1b84-920d-46ed-aeac-7e610ffb912b'];

    const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select('*')
        .in('id', sessionIds);

    console.log('Sessions by ID:', JSON.stringify(sessions, null, 2));

    // Also check all sessions
    const { data: allSessions } = await supabase
        .from('attendance_sessions')
        .select('id, class_subject_id, conducted_date')
        .limit(10);

    console.log('\nAll sessions:', JSON.stringify(allSessions, null, 2));
}
check();
