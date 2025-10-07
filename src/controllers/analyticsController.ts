// Controlador de Analytics que usa datos reales de usage_logs
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con privilegios admin para obtener métricas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ID de usuario fijo (el mismo que usamos en el dashboard)
const FIXED_USER_ID = '761ce82d-0f07-4f70-9b63-987a668b0907';

export const getAnalyticsController = async (req: any, res: any) => {
    console.log('🎯 === Analytics Controller ===');
    
    try {
        // Usar el ID de usuario fijo
        const targetUserId = FIXED_USER_ID;
        console.log('👤 Usuario target ID:', targetUserId);

        // 1. Obtener datos de usage_logs para métricas
        console.log('📈 Consultando usage_logs...');
        const { data: usageLogs, error: usageError } = await supabaseAdmin
            .from('usage_logs')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

        if (usageError) {
            console.error('❌ Error consultando usage_logs:', usageError);
            throw usageError;
        }

        console.log(`✅ Usage logs encontrados: ${usageLogs?.length || 0}`);

        // 2. Obtener API keys activas
        console.log('🔑 Consultando API keys...');
        const { data: apiKeys, error: keysError } = await supabaseAdmin
            .from('api_keys')
            .select('id, name, is_active, usage_count, usage_limit')
            .eq('user_id', targetUserId);

        if (keysError) {
            console.error('❌ Error consultando api_keys:', keysError);
            throw keysError;
        }

        console.log(`✅ API keys encontradas: ${apiKeys?.length || 0}`);

        // 3. Procesar datos para analytics
        const logs = usageLogs || [];
        const keys = apiKeys || [];

        // Calcular métricas por modelo
        const modelMetrics = logs.reduce((acc: Record<string, {count: number, sum: number}>, log) => {
            const model = log.model_name || 'unknown';
            const cost = parseFloat(log.cost) || 0;
            
            if (!acc[model]) {
                acc[model] = { count: 0, sum: 0 };
            }
            acc[model].count += 1;
            acc[model].sum += cost;
            
            return acc;
        }, {});

        // Convertir a array para la respuesta
        const metrics = Object.entries(modelMetrics).map(([model, data]) => ({
            model,
            count: data.count,
            sum: data.sum
        }));

        // Calcular resumen
        const totalRequests = logs.length;
        const totalCost = logs.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);
        const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;
        const activeApiKeys = keys.filter(key => key.is_active).length;

        // Tareas recientes (últimas 10)
        const recentTasks = logs.slice(0, 10).map(log => ({
            model: log.model_name || 'unknown',
            cost: parseFloat(log.cost) || 0,
            latency: parseInt(log.latency_ms) || 0,
            status: 'completed',
            timestamp: log.created_at,
            task_type: log.task_type || 'general',
            created_at: log.created_at
        }));

        const result = {
            metrics,
            summary: {
                total_cost: Math.round(totalCost * 100) / 100,
                total_requests: totalRequests,
                avg_cost_per_request: Math.round(avgCostPerRequest * 100) / 100,
                active_api_keys: activeApiKeys
            },
            recent_tasks: recentTasks
        };

        console.log('📊 Analytics data generada:', {
            metricsCount: metrics.length,
            totalRequests,
            totalCost,
            activeKeys: activeApiKeys,
            recentTasksCount: recentTasks.length
        });

        // Responder
        res.status(200).json(result);
        console.log('✅ Analytics data enviada correctamente');

    } catch (error) {
        console.error('❌ Error en analytics controller:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            success: false,
            details: error instanceof Error ? error.message : 'Error desconocido',
            metrics: [],
            summary: {
                total_cost: 0,
                total_requests: 0,
                avg_cost_per_request: 0,
                active_api_keys: 0
            },
            recent_tasks: []
        });
    }
};
