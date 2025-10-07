import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 DEBUG USER_ID - Investigando discrepancia de datos');

        // 1. Ver todos los registros de usage_logs con sus user_id
        const { data: allUsageLogs, error: usageError } = await supabase
            .from('usage_logs')
            .select('id, user_id, api_key_id, task_type, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (usageError) {
            console.error('❌ Error consultando usage_logs:', usageError);
        }

        // 2. Ver todos los registros de api_keys
        const { data: allApiKeys, error: apiError } = await supabase
            .from('api_keys')
            .select('id, user_id, key_prefix, is_active')
            .limit(5);

        if (apiError) {
            console.error('❌ Error consultando api_keys:', apiError);
        }

        // 3. Ver todos los usuarios
        const { data: allUsers, error: userError } = await supabase
            .from('users')
            .select('id, email, plan')
            .limit(5);

        if (userError) {
            console.error('❌ Error consultando users:', userError);
        }

        // 4. Simular la consulta que hace getUserMetrics para usuario específico
        const testUserId = allUsers?.[0]?.id || 'test-user-id';
        console.log('🧪 Testing getUserMetrics para user_id:', testUserId);

        const { data: userActivity, error: activityError } = await supabase
            .from('usage_logs')
            .select('id, task_type, model_used, cost, created_at, status, tokens_used')
            .eq('user_id', testUserId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (activityError) {
            console.error('❌ Error en consulta de actividad:', activityError);
        }

        const result = {
            timestamp: new Date().toISOString(),
            debug_info: {
                usage_logs_sample: allUsageLogs,
                api_keys_sample: allApiKeys,
                users_sample: allUsers,
                test_user_id: testUserId,
                user_activity_for_test: userActivity,
                activity_count: userActivity?.length || 0
            },
            analysis: {
                total_usage_logs: allUsageLogs?.length || 0,
                total_api_keys: allApiKeys?.length || 0,
                total_users: allUsers?.length || 0,
                user_ids_in_usage_logs: [...new Set(allUsageLogs?.map(log => log.user_id) || [])],
                user_ids_in_api_keys: [...new Set(allApiKeys?.map(key => key.user_id) || [])],
                user_ids_in_users: allUsers?.map(user => user.id) || []
            }
        };

        console.log('📊 Resultado de debug user_id:', result);
        return NextResponse.json(result);

    } catch (error) {
        console.error('💥 Error en debug-userid:', error);
        return NextResponse.json({
            error: 'Error en debug',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}