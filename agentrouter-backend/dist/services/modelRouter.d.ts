import { Model } from "../models/Model";
import { Task } from "../models/Task";
export interface RouteResult {
    selected_model: string;
    cost: number;
    estimated_time: number;
    task_type: string;
}
export declare class ModelRouter {
    private models;
    private cacheService;
    private aiProviderManager;
    constructor(models: Model[]);
    private integrateRealModels;
    routeTask(task: Task): Promise<RouteResult & {
        response?: string;
    }>;
    private createMockResult;
    private analyzeTaskType;
    private selectBestModel;
    private calculateModelScore;
    private calculateCost;
    private estimateTime;
    private estimateTokens;
    private preWarmCache;
    clearCache(): void;
    getCacheStats(): any;
    getAvailableModels(): Model[];
    getAvailableProviders(): string[];
    invalidateCacheByTaskType(taskType: string): number;
    getSystemInfo(): {
        total_models: number;
        available_providers: string[];
        cache_stats: any;
    };
}
