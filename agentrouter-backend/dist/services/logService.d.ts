import { UsageRecord } from "../models/UsageRecord";
export declare class LogService {
    logUsage(logEntry: Omit<UsageRecord, 'id' | 'created_at'>): Promise<void>;
    getMetrics(period?: string): Promise<any[]>;
    getUsageSummary(): Promise<any>;
}
