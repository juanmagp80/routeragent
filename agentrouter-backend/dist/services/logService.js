"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const database_1 = require("../config/database");
class LogService {
    async logUsage(logEntry, apiKeyId) {
        console.log('📊 [LOG SERVICE] Iniciando logUsage con:', {
            user_id: logEntry.user_id,
            model_used: logEntry.model_used,
            cost: logEntry.cost,
            api_key_id: apiKeyId
        });
        try {
            const logData = {
                ...logEntry,
                api_key_id: apiKeyId || null,
                created_at: new Date().toISOString()
            };
            console.log('📊 [LOG SERVICE] Datos a insertar:', logData);
            // Insertar en usage_records (tabla principal para métricas)
            const { error: recordError } = await database_1.supabase
                .from('usage_records')
                .insert([logData]);
            if (recordError) {
                console.error('❌ [LOG SERVICE] Usage record error:', recordError);
                // No lanzar error, intentar con usage_logs
            }
            else {
                console.log('✅ [LOG SERVICE] Successfully inserted into usage_records');
            }
            // También mantener el log en usage_logs para compatibilidad
            const { error: logError } = await database_1.supabase
                .from('usage_logs')
                .insert([logData]);
            if (logError) {
                console.error('❌ [LOG SERVICE] Usage logs error:', logError);
                // Si fallan ambas tablas, entonces sí lanzar error
                if (recordError) {
                    throw new Error(`Failed to log to both tables. Records: ${recordError.message}, Logs: ${logError.message}`);
                }
            }
            else {
                console.log('✅ [LOG SERVICE] Successfully inserted into usage_logs');
            }
            console.log('✅ [LOG SERVICE] Usage logging completed successfully');
        }
        catch (error) {
            console.error('❌ [LOG SERVICE] Error logging usage:', error);
            // En producción podrías implementar retry o fallback
            throw error;
        }
    }
    async getMetrics(period = '7d') {
        try {
            // Verificar si tenemos configuración válida de Supabase
            if (process.env.SUPABASE_URL === 'https://your-project.supabase.co' ||
                !process.env.SUPABASE_URL ||
                !process.env.SUPABASE_KEY) {
                console.log('Using mock data - Supabase not configured');
                return this.getMockMetrics();
            }
            const { data, error } = await database_1.supabase
                .from('usage_logs')
                .select('model_used, cost')
                .limit(100);
            if (error) {
                throw new Error(`Failed to fetch metrics: ${error.message}`);
            }
            // Procesar los datos para agrupar por modelo
            const processedData = this.processRawData(data || []);
            return processedData;
        }
        catch (error) {
            console.error('Metrics error:', error);
            // Devolver datos mock realistas cuando no hay conexión a Supabase
            return this.getMockMetrics();
        }
    }
    processRawData(rawData) {
        // Agrupar datos por modelo y calcular sumas
        const grouped = rawData.reduce((acc, record) => {
            const model = record.model_used;
            if (!acc[model]) {
                acc[model] = { model: model, count: 0, sum: 0 };
            }
            acc[model].count += 1;
            acc[model].sum += record.cost || 0;
            return acc;
        }, {});
        return Object.values(grouped);
    }
    getMockMetrics() {
        // Generar datos mock realistas basados en uso típico
        const mockData = [
            {
                model: 'claude-3',
                count: 45,
                sum: 0.675 // 45 * 0.015 promedio
            },
            {
                model: 'gpt-4',
                count: 23,
                sum: 0.690 // 23 * 0.030 promedio
            },
            {
                model: 'mistral-7b',
                count: 67,
                sum: 0.134 // 67 * 0.002 promedio
            },
            {
                model: 'llama-3',
                count: 89,
                sum: 0.089 // 89 * 0.001 promedio
            }
        ];
        return mockData;
    }
    async getUsageSummary() {
        try {
            const { data, error } = await database_1.supabase
                .from('usage_logs')
                .select('sum(cost), count(*)')
                .single();
            if (error) {
                throw new Error(`Failed to fetch summary: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Summary error:', error);
            return { sum: 0, count: 0 };
        }
    }
}
exports.LogService = LogService;
