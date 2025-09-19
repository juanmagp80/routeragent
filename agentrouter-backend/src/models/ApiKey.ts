export interface ApiKey {
    id: string;
    user_id: string | null;
    key_hash: string;
    key_prefix: string; // Primeros 8 caracteres para mostrar al usuario
    name: string;
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    usage_limit: number; // Límite de tareas por mes
    usage_count: number; // Contador actual
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