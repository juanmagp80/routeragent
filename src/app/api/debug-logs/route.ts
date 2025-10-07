import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        // Ver TODOS los campos de los registros en usage_logs
        const { data: allLogs, error } = await supabase
            .from('usage_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error('❌ Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('🔍 Registros completos en usage_logs:', allLogs);

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            total_records: allLogs?.length || 0,
            records: allLogs,
            analysis: {
                has_user_id: allLogs?.some(log => log.user_id !== null && log.user_id !== undefined),
                user_id_values: allLogs?.map(log => log.user_id),
                api_key_id_values: allLogs?.map(log => log.api_key_id),
                sample_record_keys: allLogs?.[0] ? Object.keys(allLogs[0]) : []
            }
        });

    } catch (error) {
        console.error('💥 Error:', error);
        return NextResponse.json({ 
            error: 'Error consultando usage_logs',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}