/**
 * TypeScript definitions for AgentRouter MCP SDK
 */

export interface ModelPreferences {
    preferredModels?: string[];
    avoidModels?: string[];
    qualityTarget?: 'high' | 'medium' | 'low';
    costTarget?: 'low' | 'medium' | 'high';
}

export interface RouteParams {
    input: string;
    taskType?: 'summary' | 'translation' | 'analysis' | 'general' | 'coding';
    modelPreferences?: ModelPreferences;
}

export interface RouteResponse {
    selected_model: string;
    cost: number;
    estimated_time: number;
    response: string;
    task_type: string;
    success: boolean;
    is_real_ai: boolean;
    api_key_info?: {
        usage_count: number;
        usage_limit: number;
        plan: string;
    };
}

export interface MetricsResponse {
    metrics: Array<{
        model: string;
        count: number;
        sum: number;
    }>;
    summary: {
        total_cost: number;
        total_requests: number;
        avg_cost_per_request: number;
    };
    recent_tasks: Array<{
        model: string;
        cost: number;
        latency: number;
        status: string;
        timestamp: string;
    }>;
    success: boolean;
}

export interface ApiKeyStats {
    total_cost: number;
    total_tokens: number;
    total_requests: number;
    recent_usage: Array<{
        cost: number;
        tokens_used: number;
        model_used: string;
        created_at: string;
    }>;
}

export interface PerformanceStats {
    cache_stats: {
        size: number;
        maxSize: number;
        hitRate: number;
        topTasks: Array<{
            taskType: string;
            count: number;
        }>;
    };
    model_stats: {
        available_models: Array<{
            id: string;
            name: string;
            provider: string;
            cost_per_token: number;
            quality_rating: number;
            speed_rating: number;
            supported_tasks: string[];
        }>;
        provider_stats: {
            available_providers: string[];
            total_models: number;
        };
    };
    system_info: {
        uptime: number;
        memory_usage: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
        };
        node_version: string;
    };
    success: boolean;
}

export interface AgentRouterOptions {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
}

export interface ValidationResponse {
    success: boolean;
    valid: boolean;
    key_info?: {
        id: string;
        name: string;
        plan: string;
        usage_count: number;
        usage_limit: number;
        remaining: number | 'unlimited';
    };
}

export interface ClearCacheResponse {
    success: boolean;
    message: string;
    invalidated_entries?: number;
}

declare class AgentRouter {
    constructor(apiKey: string, options?: AgentRouterOptions);

    /**
     * Route a task to the optimal AI model
     */
    route(params: RouteParams): Promise<RouteResponse>;

    /**
     * Get usage metrics for your API key
     */
    getMetrics(): Promise<MetricsResponse>;

    /**
     * Get API key statistics
     */
    getApiKeyStats(keyId: string): Promise<{ success: boolean; stats: ApiKeyStats }>;

    /**
     * Validate API key
     */
    validateKey(): Promise<ValidationResponse>;

    /**
     * Get performance statistics
     */
    getPerformanceStats(): Promise<PerformanceStats>;

    /**
     * Clear cache
     */
    clearCache(taskType?: string): Promise<ClearCacheResponse>;

    /**
     * Batch process multiple tasks
     */
    batchRoute(tasks: RouteParams[]): Promise<RouteResponse[]>;

    /**
     * Stream processing for large tasks
     */
    streamRoute(params: RouteParams, onChunk?: (chunk: RouteResponse) => void): Promise<RouteResponse>;

    /**
     * Get SDK version
     */
    static getVersion(): string;

    /**
     * Create a new AgentRouter instance
     */
    static create(apiKey: string, options?: AgentRouterOptions): AgentRouter;
}

export default AgentRouter;