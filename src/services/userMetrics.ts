import { createClient } from '@supabase/supabase-js';
import { backendService } from './backendService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserMetrics {
    requests: number;
    cost: number;
    limit: number;
    apiKeysCount: number;
    recentActivity: ActivityRecord[];
}

export interface ActivityRecord {
    id: string;
    task_type: string;
    model_used: string;
    cost: number;
    created_at: string;
    status: string;
    tokens_used?: number;
}

export interface UserStats {
    totalRequests: number;
    totalCost: number;
    requestsThisMonth: number;
    costThisMonth: number;
    avgResponseTime: number;
    mostUsedModel: string;
}

/**
 * Obtiene las métricas principales del usuario para el dashboard
 * Combina datos de Supabase (base de datos) y del backend (métricas en tiempo real)
 */
export async function getUserMetrics(userId: string): Promise<UserMetrics> {
    try {
        console.log('📊 Obteniendo métricas para usuario:', userId);

        // 1. Intentar obtener métricas del backend primero
        let backendMetrics = null;
        try {
            const isBackendAvailable = await backendService.healthCheck();
            if (isBackendAvailable) {
                backendMetrics = await backendService.getMetrics();
                console.log('🎯 Métricas del backend obtenidas:', backendMetrics);
            }
        } catch (backendError) {
            console.warn('⚠️ Backend no disponible, usando datos de Supabase:', backendError);
        }

        // 2. Obtener datos de Supabase como respaldo o complemento
        const { data: usageLogs, error: usageError } = await supabase
            .from('usage_logs')
            .select('id')
            .eq('user_id', userId);

        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id, task_type, model_selected, cost, created_at, status, tokens_used')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        const { data: usageRecords, error: recordsError } = await supabase
            .from('usage_records')
            .select('cost')
            .eq('user_id', userId);

        const { data: apiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true);

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('api_key_limit, plan')
            .eq('id', userId)
            .single();

        if (usageError || tasksError || recordsError || keysError || userError) {
            console.error('Error obteniendo métricas de Supabase:', { usageError, tasksError, recordsError, keysError, userError });
        }

        // 3. Calcular métricas combinando backend y Supabase
        let totalRequests = 0;
        let totalCost = 0;
        let recentActivity: ActivityRecord[] = [];

        if (backendMetrics && backendMetrics.success) {
            // Usar métricas del backend si están disponibles
            totalRequests = backendMetrics.summary.total_requests || 0;
            totalCost = backendMetrics.summary.total_cost || 0;
            
            // Convertir recent_tasks del backend al formato ActivityRecord
            recentActivity = (backendMetrics.recent_tasks || []).map(task => ({
                id: `backend_${Date.now()}_${Math.random()}`,
                task_type: 'general', // El backend no incluye task_type en recent_tasks
                model_used: task.model,
                cost: task.cost,
                created_at: task.timestamp,
                status: task.status,
                tokens_used: Math.ceil(task.latency / 10) // Estimación
            }));
        } else {
            // Fallback a cálculos con datos de Supabase
            totalRequests = (usageLogs?.length || 0) + (tasks?.length || 0);
            const totalCostFromRecords = usageRecords?.reduce((sum, record) => sum + parseFloat(record.cost || '0'), 0) || 0;
            const totalCostFromTasks = tasks?.reduce((sum, task) => sum + parseFloat(task.cost || '0'), 0) || 0;
            totalCost = totalCostFromRecords + totalCostFromTasks;
            
            // Formatear actividad reciente desde Supabase
            recentActivity = (tasks || []).map(task => ({
                id: task.id,
                task_type: task.task_type || 'unknown',
                model_used: task.model_selected || 'unknown',
                cost: parseFloat(task.cost || '0'),
                created_at: task.created_at,
                status: task.status || 'unknown',
                tokens_used: task.tokens_used
            }));
        }

        const userLimit = userData?.api_key_limit ? userData.api_key_limit * 1000 : 1000;
        const apiKeysCount = apiKeys?.length || 0;

        console.log('✅ Métricas finales calculadas:', {
            totalRequests,
            totalCost: totalCost.toFixed(2),
            userLimit,
            apiKeysCount,
            activityCount: recentActivity.length,
            source: backendMetrics ? 'backend' : 'supabase'
        });

        return {
            requests: totalRequests,
            cost: parseFloat(totalCost.toFixed(2)),
            limit: userLimit,
            apiKeysCount,
            recentActivity
        };

    } catch (error) {
        console.error('💥 Error obteniendo métricas de usuario:', error);
        return {
            requests: 0,
            cost: 0,
            limit: 1000,
            apiKeysCount: 0,
            recentActivity: []
        };
    }
}

/**
 * Obtiene estadísticas adicionales del usuario
 */
export async function getUserStats(userId: string): Promise<UserStats> {
    try {
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Intentar obtener datos de las tablas de métricas, pero manejar errores graciosamente
        let allTasks: any[] = [];
        let allRecords: any[] = [];

        // Intentar obtener todas las tasks del usuario
        try {
            const { data: tasksData, error: allTasksError } = await supabase
                .from('tasks')
                .select('cost, created_at, latency_ms, model_selected')
                .eq('user_id', userId);
            
            if (!allTasksError && tasksData) {
                allTasks = tasksData;
            }
        } catch (error) {
            console.log('Tabla tasks no existe aún, usando datos simulados');
        }

        // Intentar obtener usage_records del usuario
        try {
            const { data: recordsData, error: recordsError } = await supabase
                .from('usage_records')
                .select('cost, created_at, latency_ms, model_used')
                .eq('user_id', userId);
            
            if (!recordsError && recordsData) {
                allRecords = recordsData;
            }
        } catch (error) {
            console.log('Tabla usage_records no existe aún, usando datos simulados');
        }

        // Si no hay datos reales, retornar estadísticas por defecto
        if (allTasks.length === 0 && allRecords.length === 0) {
            return {
                totalRequests: 0,
                totalCost: 0,
                requestsThisMonth: 0,
                costThisMonth: 0,
                avgResponseTime: 0,
                mostUsedModel: 'N/A'
            };
        }

        // Combinar datos de tasks y records
        const allData = [
            ...allTasks.map(t => ({
                cost: parseFloat(t.cost || '0'),
                created_at: t.created_at,
                latency_ms: t.latency_ms || 0,
                model: t.model_selected || 'unknown'
            })),
            ...allRecords.map(r => ({
                cost: parseFloat(r.cost || '0'),
                created_at: r.created_at,
                latency_ms: r.latency_ms || 0,
                model: r.model_used || 'unknown'
            }))
        ];

        // Calcular estadísticas
        const totalRequests = allData.length;
        const totalCost = allData.reduce((sum, item) => sum + item.cost, 0);

        const thisMonthData = allData.filter(item => 
            new Date(item.created_at) >= firstDayThisMonth
        );
        const requestsThisMonth = thisMonthData.length;
        const costThisMonth = thisMonthData.reduce((sum, item) => sum + item.cost, 0);

        const avgResponseTime = allData.length > 0 
            ? allData.reduce((sum, item) => sum + (item.latency_ms || 0), 0) / allData.length 
            : 0;

        // Encontrar modelo más usado
        const modelCounts = allData.reduce((acc, item) => {
            acc[item.model] = (acc[item.model] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostUsedModel = Object.keys(modelCounts).length > 0 
            ? Object.keys(modelCounts).reduce((a, b) => modelCounts[a] > modelCounts[b] ? a : b)
            : 'N/A';

        return {
            totalRequests,
            totalCost: parseFloat(totalCost.toFixed(2)),
            requestsThisMonth,
            costThisMonth: parseFloat(costThisMonth.toFixed(2)),
            avgResponseTime: Math.round(avgResponseTime),
            mostUsedModel
        };

    } catch (error) {
        console.error('💥 Error obteniendo estadísticas de usuario:', error);
        return {
            totalRequests: 0,
            totalCost: 0,
            requestsThisMonth: 0,
            costThisMonth: 0,
            avgResponseTime: 0,
            mostUsedModel: 'N/A'
        };
    }
}

/**
 * Obtiene actividad reciente del usuario con más detalles
 */
export async function getRecentActivity(userId: string, limit: number = 5): Promise<ActivityRecord[]> {
    try {
        // Obtener tasks recientes con más información
        const { data: recentTasks, error } = await supabase
            .from('tasks')
            .select('id, task_type, model_selected, cost, created_at, status, tokens_used, input')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error obteniendo actividad reciente:', error);
            return [];
        }

        return (recentTasks || []).map(task => ({
            id: task.id,
            task_type: task.task_type || 'Tarea desconocida',
            model_used: task.model_selected || 'Modelo desconocido',
            cost: parseFloat(task.cost || '0'),
            created_at: task.created_at,
            status: task.status || 'unknown',
            tokens_used: task.tokens_used
        }));

    } catch (error) {
        console.error('💥 Error obteniendo actividad reciente:', error);
        return [];
    }
}
