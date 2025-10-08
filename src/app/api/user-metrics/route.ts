import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Cliente Supabase con privilegios admin para obtener métricas
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

        console.log('📊 [USER-METRICS] Obteniendo métricas para usuario:', userId);

        // Obtener datos de usage_records
        const { data: usageRecords, error: usageError } = await supabaseAdmin
            .from('usage_records')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (usageError) {
            console.error('❌ Error consultando usage_records:', usageError);
            throw usageError;
        }

        // Obtener API keys del usuario
        const { data: apiKeys, error: keysError } = await supabaseAdmin
            .from('api_keys')
            .select('*')
            .eq('user_id', userId);

        if (keysError) {
            console.error('❌ Error consultando api_keys:', keysError);
            throw keysError;
        }

        // Calcular métricas
        const totalRequests = usageRecords?.length || 0;
        const totalCost = usageRecords?.reduce((sum, record) => sum + parseFloat(record.cost || '0'), 0) || 0;
        const activeKeys = apiKeys?.filter(key => key.is_active).length || 0;
        const avgLatency = usageRecords?.length > 0 
            ? usageRecords.reduce((sum, record) => sum + (parseInt(record.latency_ms) || 0), 0) / usageRecords.length
            : 0;

        const response = {
            success: true,
            requests: totalRequests,
            cost: parseFloat(totalCost.toFixed(4)),
            activeKeys,
            avgLatency: Math.round(avgLatency),
            data: {
                totalRequests,
                totalCost: parseFloat(totalCost.toFixed(4)),
                activeKeys,
                avgLatency: Math.round(avgLatency),
                records: usageRecords || [],
                apiKeys: apiKeys || []
            }
        };

        console.log('✅ [USER-METRICS] Métricas calculadas:', {
            totalRequests,
            totalCost: totalCost.toFixed(4),
            activeKeys,
            avgLatency: Math.round(avgLatency)
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ [USER-METRICS] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch user metrics',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}