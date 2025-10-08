import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const FIXED_USER_ID = '761ce82d-0f07-4f70-9b63-987a668b0907';

export const getAnalyticsController = async (req: any, res: any) => {
    try {
        console.log('📊 [ANALYTICS-CONTROLLER] Iniciando...');

        // Obtener datos de usage_records (ordenados por fecha DESC para obtener los más recientes)
        const { data: usageRecords, error } = await supabaseAdmin
            .from('usage_records')
            .select('*')
            .eq('user_id', FIXED_USER_ID)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`✅ Records encontrados: ${usageRecords?.length || 0}`);

        // Obtener API keys
        const { data: apiKeys, error: keysError } = await supabaseAdmin
            .from('api_keys')
            .select('*')
            .eq('user_id', FIXED_USER_ID);

        if (keysError) {
            console.warn('⚠️ Error obteniendo API keys:', keysError);
        }

        const records = usageRecords || [];

        // Calcular métricas por modelo
        const modelMetrics: Record<string, { count: number, cost: number }> = {};
        records.forEach(record => {
            const model = record.model_used || 'unknown';
            if (!modelMetrics[model]) {
                modelMetrics[model] = { count: 0, cost: 0 };
            }
            modelMetrics[model].count += 1;
            modelMetrics[model].cost += parseFloat(record.cost || '0');
        });

        // Calcular totales
        const totalRequests = records.length;
        const totalCost = records.reduce((sum, record) => sum + parseFloat(record.cost || '0'), 0);

        // Formatear para página de Analytics
        const metrics = Object.entries(modelMetrics).map(([model, data]) => ({
            model,
            count: data.count,
            sum: data.cost
        }));

        const summary = {
            total_requests: totalRequests,
            total_cost: totalCost,
            avg_cost_per_request: totalRequests > 0 ? totalCost / totalRequests : 0,
            active_api_keys: apiKeys?.filter(key => key.is_active).length || 0
        };

        const recent_tasks = records.slice(0, 10).map(record => ({
            model: record.model_used || 'unknown',
            cost: parseFloat(record.cost || '0'),
            latency: parseInt(record.latency_ms) || 0,
            status: 'completed',
            timestamp: record.created_at,
            task_type: 'general',
            created_at: record.created_at
        }));

        const responseData = {
            success: true,
            metrics,
            summary,
            recent_tasks
        };

        console.log('✅ [ANALYTICS-CONTROLLER] Datos procesados:', {
            totalRequests,
            totalCost: totalCost.toFixed(4),
            metricsCount: metrics.length,
            tasksCount: recent_tasks.length
        });

        res.status(200).json(responseData);

    } catch (error) {
        console.error('❌ [ANALYTICS-CONTROLLER] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
};
