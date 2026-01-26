import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testHistoryQuery() {
    const classSubjectId = 'b9b57105-5cd0-48b8-a5c6-9ca0f71a56b6';
    const studentId = 'b5635b47-68a2-4295-86ef-21b125bf5e7f';

    console.log('Testing attendance history query...\n');

    // Query sessions
    const { data: sessions, error } = await supabase
        .from('attendance_sessions')
        .select(`
            id,
            conducted_date,
            conducted_time,
            session_type,
            attendance_records (
                student_id,
                status
            )
        `)
        .eq('class_subject_id', classSubjectId)
        .order('conducted_date', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Sessions found:', sessions?.length);
    console.log('Sessions data:', JSON.stringify(sessions, null, 2));

    // Map to history
    const history = (sessions || []).map((session: any) => {
        const studentRecord = session.attendance_records?.find((r: any) => r.student_id === studentId);
        console.log(`Session ${session.id}: records count=${session.attendance_records?.length}, found student=${!!studentRecord}`);
        return {
            session_id: session.id,
            date: session.conducted_date,
            time: session.conducted_time,
            status: studentRecord?.status || 'not_marked',
        };
    });

    console.log('\nFinal history:', JSON.stringify(history, null, 2));
}

testHistoryQuery();
