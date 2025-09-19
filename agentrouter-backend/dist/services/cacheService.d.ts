import { RouteResult } from './modelRouter';
export interface CacheEntry {
    key: string;
    result: RouteResult & {
        response?: string;
    };
    timestamp: number;
    hits: number;
    taskType: string;
    inputHash: string;
}
export declare class CacheService {
    private cache;
    private maxSize;
    private ttl;
    constructor(maxSize?: number, ttlMinutes?: number);
    private generateHash;
    private generateCacheKey;
    get(input: string, taskType: string): (RouteResult & {
        response?: string;
    }) | null;
    set(input: string, taskType: string, result: RouteResult & {
        response?: string;
    }): void;
    private evictLeastUsed;
    private cleanup;
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        topTasks: Array<{
            taskType: string;
            count: number;
        }>;
    };
    clear(): void;
    invalidateByTaskType(taskType: string): number;
    preWarm(commonQueries: Array<{
        input: string;
        taskType: string;
        result: RouteResult & {
            response?: string;
        };
    }>): void;
}
