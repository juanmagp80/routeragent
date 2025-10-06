// Controlador de métricas que consulta datos reales del usuario
import { supabase } from '../config/database';

export const getMetricsReal = async (req: any, res: any) => {
    console.log('🔍 === INICIO getMetricsReal ===');
    
    try {
        // Obtener el usuario desde el request
        const userId = req.userId || req.user?.id || '3a942f65-25e7-4de3-84cb-3df0268ff759';
        console.log('👤 Usuario ID:', userId);

        // Consultar datos reales de Supabase
        let tasks: any[] = [];
        let apiKeys: any[] = [];
        let hasErrors = false;

        try {
            console.log('📊 Consultando tasks del usuario...');
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('model_selected, cost, latency_ms, status, created_at, task_type')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (tasksError) {
                console.warn('⚠️ Error consultando tasks:', tasksError.message);
                if (!tasksError.message.includes('does not exist')) {
                    hasErrors = true;
                }
            } else {
                tasks = tasksData || [];
                console.log('✅ Tasks encontradas:', tasks.length);
            }
        } catch (error) {
            console.warn('⚠️ Excepción consultando tasks:', error);
        }

        try {
            console.log('🔑 Consultando API keys del usuario...');
            const { data: apiKeysData, error: apiKeysError } = await supabase
                .from('api_keys')
                .select('id, usage_count, is_active')
                .eq('user_id', userId)
                .eq('is_active', true);

            if (apiKeysError) {
                console.warn('⚠️ Error consultando api_keys:', apiKeysError.message);
                if (!apiKeysError.message.includes('does not exist')) {
                    hasErrors = true;
                }
            } else {
                apiKeys = apiKeysData || [];
                console.log('✅ API Keys encontradas:', apiKeys.length);
            }
        } catch (error) {
            console.warn('⚠️ Excepción consultando api_keys:', error);
        }

        // Procesar datos reales si existen
        let metrics: any[] = [];
        let totalCost = 0;
        let totalRequests = 0;
        let recentTasks: any[] = [];

        if (tasks && tasks.length > 0) {
            // Agrupar métricas por modelo
            const modelMetrics: { [key: string]: { count: number; sum: number } } = {};
            
            tasks.forEach((task: any) => {
                const model = task.model_selected || 'unknown';
                const cost = parseFloat(task.cost || '0');
                
                if (!modelMetrics[model]) {
                    modelMetrics[model] = { count: 0, sum: 0 };
                }
                modelMetrics[model].count++;
                modelMetrics[model].sum += cost;
                
                totalCost += cost;
                totalRequests++;
            });

            // Convertir a array
            metrics = Object.entries(modelMetrics).map(([model, data]) => ({
                model,
                count: data.count,
                sum: data.sum
            }));

            // Crear lista de tareas recientes
            recentTasks = tasks.slice(0, 5).map((task: any) => ({
                model: task.model_selected || 'unknown',
                cost: parseFloat(task.cost || '0'),
                latency: task.latency_ms || 0,
                status: task.status || 'completed',
                timestamp: task.created_at,
                task_type: task.task_type || 'general'
            }));
        }

        const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;
        const activeApiKeys = apiKeys.length;

        const response = {
            metrics,
            summary: {
                total_cost: totalCost,
                total_requests: totalRequests,
                avg_cost_per_request: avgCostPerRequest,
                active_api_keys: activeApiKeys
            },
            recent_tasks: recentTasks,
            success: true
        };

        console.log('📊 Respuesta final:', {
            totalTasks: totalRequests,
            totalCost: totalCost.toFixed(4),
            modelsCount: metrics.length,
            activeApiKeys
        });

        res.json(response);

    } catch (error: unknown) {
        console.error('💥 Error en getMetricsReal:', error);
        console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            error: "Failed to fetch real metrics",
            success: false,
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
