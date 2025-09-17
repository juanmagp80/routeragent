import { supabase } from "../config/database";
import { UsageRecord } from "../models/UsageRecord";

export class LogService {
    async logUsage(logEntry: Omit<UsageRecord, 'id' | 'created_at'>): Promise<void> {
        try {
            const { error } = await supabase
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
        } catch (error) {
            console.error('Error logging usage:', error);
            // En producción podrías implementar retry o fallback
            throw error;
        }
    }

    async getMetrics(period: string = '7d'): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('usage_logs')
                .select('model_used, count(*), sum(cost)')
                .range(0, 100)
                .order('count', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch metrics: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Metrics error:', error);
            return [];
        }
    }

    async getUsageSummary(): Promise<any> {
        try {
            const { data, error } = await supabase
                .from('usage_logs')
                .select('sum(cost), count(*)')
                .single();

            if (error) {
                throw new Error(`Failed to fetch summary: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Summary error:', error);
            return { sum: 0, count: 0 };
        }
    }
}