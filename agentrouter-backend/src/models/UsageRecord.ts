export interface UsageRecord {
    id: string;
    user_id?: string;
    model_used: string;
    cost: number;
    latency_ms: number;
    tokens_used?: number;
    prompt_preview?: string;
    capabilities?: any[];
    created_at: Date;
}