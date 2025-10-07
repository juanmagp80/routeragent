import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const targetUserId = '761ce82d-0f07-4f70-9b63-987a668b0907';

        console.log('🔍 Consulta directa para user_id:', targetUserId);

        // Consulta exacta que debería usar el dashboard
        const { data: userLogs, error: logsError } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

        console.log('📋 Resultado consulta:', { userLogs, logsError });

        // También contar sin filtro para comparar
        const { data: allLogs, error: allError } = await supabase
            .from('usage_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        // Verificar API keys para este usuario
        const { data: userApiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', targetUserId);

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            target_user_id: targetUserId,
            user_logs: {
                data: userLogs,
                error: logsError?.message,
                count: userLogs?.length || 0
            },
            all_logs_sample: {
                data: allLogs,
                error: allError?.message,
                count: allLogs?.length || 0
            },
            user_api_keys: {
                data: userApiKeys,
                error: keysError?.message,
                count: userApiKeys?.length || 0
            },
            analysis: {
                has_user_logs: (userLogs?.length || 0) > 0,
                total_logs_in_db: allLogs?.length || 0,
                user_has_api_keys: (userApiKeys?.length || 0) > 0,
                user_ids_in_all_logs: [...new Set(allLogs?.map(log => log.user_id) || [])]
            }
        });

    } catch (error) {
        console.error('💥 Error en simple-query:', error);
        return NextResponse.json({
            error: 'Error en consulta simple',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}