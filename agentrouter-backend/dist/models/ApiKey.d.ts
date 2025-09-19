export interface ApiKey {
    id: string;
    user_id: string | null;
    key_hash: string;
    key_prefix: string;
    name: string;
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    usage_limit: number;
    usage_count: number;
    is_active: boolean;
    created_at: string;
    last_used_at: string | null;
    expires_at: string | null;
}
export interface ApiKeyUsage {
    id: string;
    api_key_id: string;
    endpoint: string;
    cost: number;
    tokens_used: number;
    model_used: string;
    created_at: string;
}
