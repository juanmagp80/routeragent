import { createClient } from '@supabase/supabase-js';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Cliente Supabase para autenticación
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces para el backend
export interface RouteRequest {
    input: string;
    task_type?: 'summary' | 'translation' | 'analysis' | 'general' | 'coding';
    model_preferences?: {
        preferred_models?: string[];
        avoid_models?: string[];
        quality_target?: 'low' | 'medium' | 'high';
        cost_target?: 'low' | 'medium' | 'high';
    };
    context?: {
        user_id?: string;
        capabilities?: string[];
    };
}

export interface RouteResponse {
    selected_model: string;
    cost: number;
    estimated_time: number;
    response: string;
    task_type: string;
    success: boolean;
    api_key_info?: {
        usage_count: number;
        usage_limit: number;
        plan: string;
    };
    is_real_ai: boolean;
}

export interface BackendMetrics {
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

export interface ApiKeyData {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    usage_count: number;
    usage_limit: number;
    last_used_at?: string;
    created_at: string;
    plan: string;
}

export interface CreateApiKeyRequest {
    name: string;
    user_id: string;
    usage_limit?: number;
    plan?: string;
}

export class BackendService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = BACKEND_URL;
    }

    /**
     * Obtiene el token de autenticación actual
     */
    private async getAuthToken(): Promise<string | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session?.access_token || null;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    /**
     * Obtiene el usuario actual
     */
    private async getCurrentUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Hace una request HTTP al backend con autenticación
     */
    private async makeRequest<T>(
        endpoint: string, 
        options: RequestInit = {},
        requiresAuth: boolean = false
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>
        };

        // Agregar token de autenticación si se requiere
        if (requiresAuth) {
            const token = await this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            console.log(`🌐 Backend request: ${options.method || 'GET'} ${url}`);
            
            // Crear AbortController para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
            
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ Backend response:`, data);
            
            return data;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.error(`⏱️ Backend request timeout: ${url}`);
                throw new Error('Request timeout - la solicitud tardó demasiado');
            }
            console.error(`❌ Backend request failed:`, error);
            throw error;
        }
    }

    /**
     * Ruta una tarea al modelo óptimo
     */
    async routeTask(request: RouteRequest, apiKey?: string): Promise<RouteResponse> {
        const headers: Record<string, string> = {};
        
        // Usar ruta de testing si no hay API key, ruta normal si la hay
        const endpoint = apiKey ? '/v1/route' : '/v1/route-test';
        
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        // Agregar user_id del usuario autenticado
        const user = await this.getCurrentUser();
        if (user && request.context) {
            request.context.user_id = user.id;
        }

        return this.makeRequest<RouteResponse>(endpoint, {
            method: 'POST',
            body: JSON.stringify(request),
            headers
        });
    }

    /**
     * Obtiene métricas del backend
     */
    async getMetrics(): Promise<BackendMetrics> {
        return this.makeRequest<BackendMetrics>('/v1/metrics');
    }

    /**
     * Obtiene estadísticas de rendimiento
     */
    async getPerformanceStats(): Promise<any> {
        return this.makeRequest('/v1/performance');
    }

    /**
     * Obtiene las API keys del usuario autenticado
     */
    async getApiKeys(): Promise<ApiKeyData[]> {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const response = await this.makeRequest<{ api_keys: ApiKeyData[]; success: boolean }>('/v1/api-keys', {
            method: 'GET'
        }, true);

        return response.api_keys || [];
    }

    /**
     * Crea una nueva API key
     */
    async createApiKey(request: CreateApiKeyRequest): Promise<ApiKeyData> {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        request.user_id = user.id;

        const response = await this.makeRequest<{ api_key: ApiKeyData; success: boolean }>('/v1/api-keys', {
            method: 'POST',
            body: JSON.stringify(request)
        }, true);

        return response.api_key;
    }

    /**
     * Desactiva una API key
     */
    async deactivateApiKey(keyId: string): Promise<void> {
        await this.makeRequest(`/v1/api-keys/${keyId}`, {
            method: 'DELETE'
        }, true);
    }

    /**
     * Elimina una API key (alias para deactivateApiKey)
     */
    async deleteApiKey(keyId: string): Promise<void> {
        return this.deactivateApiKey(keyId);
    }

    /**
     * Obtiene estadísticas de una API key específica
     */
    async getApiKeyStats(keyId: string): Promise<any> {
        return this.makeRequest(`/v1/api-keys/${keyId}/stats`, {
            method: 'GET'
        }, true);
    }

    /**
     * Valida una API key
     */
    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            const response = await this.makeRequest<{ valid: boolean; success: boolean }>('/v1/api-keys/validate', {
                method: 'POST',
                body: JSON.stringify({ api_key: apiKey })
            });

            return response.valid;
        } catch (error) {
            return false;
        }
    }

    /**
     * Limpia el cache del router
     */
    async clearCache(taskType?: string): Promise<void> {
        await this.makeRequest('/v1/cache/clear', {
            method: 'POST',
            body: JSON.stringify({ task_type: taskType })
        }, true);
    }

    /**
     * Verifica si el backend está disponible
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.makeRequest('/');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtiene información del sistema
     */
    async getSystemInfo(): Promise<any> {
        return this.makeRequest('/');
    }
}

// Instancia singleton del servicio
export const backendService = new BackendService();
