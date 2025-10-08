import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Cliente Supabase con privilegios admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        console.log('🧪 [TEST-METRICS] Probando función getUserMetrics actualizada para:', userId);

        // Probar directamente las consultas que usa getUserMetrics
        const results = await Promise.allSettled([
            // Query 1: Contar API keys activas
            supabaseAdmin
                .from('api_keys')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_active', true),

            // Query 2: Obtener actividad reciente de usage_records
            supabaseAdmin
                .from('usage_records')
                .select('id, model_used, cost, created_at, tokens_used, latency_ms')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10),

            // Query 3: Suma total de costos de usage_records
            supabaseAdmin
                .from('usage_records')
                .select('cost')
                .eq('user_id', userId),

            // Query 4: Info del usuario
            supabaseAdmin
                .from('users')
                .select('api_key_limit, plan')
                .eq('id', userId)
                .single(),

            // Query 5: Contar total de requests de usage_records
            supabaseAdmin
                .from('usage_records')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
        ]);

        const [apiKeysResult, activityResult, costsResult, userResult, requestsCountResult] = results;

        // Procesar cada resultado
        let apiKeysCount = 0;
        let recentActivity = [];
        let totalCost = 0;
        let totalRequests = 0;
        let userLimit = 1000;

        // API Keys
        if (apiKeysResult.status === 'fulfilled' && !apiKeysResult.value.error) {
            apiKeysCount = apiKeysResult.value.count || 0;
        }

        // Actividad reciente
        if (activityResult.status === 'fulfilled' && !activityResult.value.error) {
            recentActivity = activityResult.value.data || [];
        }

        // Costos totales
        if (costsResult.status === 'fulfilled' && !costsResult.value.error) {
            const costs = costsResult.value.data || [];
            totalCost = costs.reduce((sum: number, record: any) => sum + parseFloat(record.cost || '0'), 0);
        }

        // Límite del usuario
        if (userResult.status === 'fulfilled' && !userResult.value.error) {
            const userData = userResult.value.data;
            userLimit = userData?.api_key_limit ? userData.api_key_limit * 1000 : 1000;
        }

        // Total de requests
        if (requestsCountResult.status === 'fulfilled' && !requestsCountResult.value.error) {
            totalRequests = requestsCountResult.value.count || 0;
        }

        return NextResponse.json({
            success: true,
            message: 'getUserMetrics test completed',
            results: {
                apiKeysResult: apiKeysResult.status === 'fulfilled' ? { count: apiKeysResult.value.count, error: apiKeysResult.value.error } : { error: apiKeysResult.reason },
                activityResult: activityResult.status === 'fulfilled' ? { count: activityResult.value.data?.length, error: activityResult.value.error } : { error: activityResult.reason },
                costsResult: costsResult.status === 'fulfilled' ? { count: costsResult.value.data?.length, error: costsResult.value.error } : { error: costsResult.reason },
                userResult: userResult.status === 'fulfilled' ? { data: userResult.value.data, error: userResult.value.error } : { error: userResult.reason },
                requestsCountResult: requestsCountResult.status === 'fulfilled' ? { count: requestsCountResult.value.count, error: requestsCountResult.value.error } : { error: requestsCountResult.reason }
            },
            computed: {
                requests: totalRequests,
                cost: parseFloat(totalCost.toFixed(4)),
                limit: userLimit,
                apiKeysCount,
                activityCount: recentActivity.length
            }
        });

    } catch (error) {
        console.error('❌ [TEST-METRICS] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to test getUserMetrics',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}