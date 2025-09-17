"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const database_1 = require("../config/database");
class LogService {
    async logUsage(logEntry) {
        try {
            const { error } = await database_1.supabase
                .from('usage_logs')
                .insert([{
                    ...logEntry,
                    created_at: new Date().toISOString()
                }]);
            if (error) {
                console.error('Log error:', error);
                throw new Error(`Failed to log usage: ${error.message}`);
            }
            console.log('Successfully logged usage to Supabase');
        }
        catch (error) {
            console.error('Error logging usage:', error);
            // En producción podrías implementar retry o fallback
            throw error;
        }
    }
    async getMetrics(period = '7d') {
        try {
            const { data, error } = await database_1.supabase
                .from('usage_logs')
                .select('model_used, count(*), sum(cost)')
                .range(0, 100)
                .order('count', { ascending: false });
            if (error) {
                throw new Error(`Failed to fetch metrics: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            console.error('Metrics error:', error);
            return [];
        }
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
