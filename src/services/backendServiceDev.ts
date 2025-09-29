/**
 * Servicio temporal para desarrollo sin autenticación
 * TODO: Remover este archivo cuando la autenticación esté funcionando
 */

import { BACKEND_URL } from '@/config/backend';

export interface ApiKeyData {
    id: string;
    name: string;
    key_prefix: string;
    plan: string;
    usage_count: number;
    usage_limit: number | null;
    is_active: boolean;
    created_at: string;
    last_used: string | null;
    // Propiedades adicionales para compatibilidad con el UI
    key?: string;
    prefix?: string;
}

export interface CreateApiKeyRequest {
    name: string;
    plan?: string;
    usage_limit?: number;
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
        active_api_keys: number;
    };
    recent_tasks: Array<{
        model: string;
        task_type: string;
        cost: number;
        created_at: string;
    }>;
}

export interface BillingInfo {
    current_plan: {
        id: string;
        name: string;
        price: number;
        currency: string;
        billing_cycle: string;
        next_billing_date: string;
        status: string;
    };
    usage: {
        current_requests: number;
        request_limit: number;
        usage_percentage: number;
        total_cost: number;
        billing_period_start: string;
        billing_period_end: string;
    };
    payment_method: {
        type: string;
        last4: string;
        brand: string;
        expires: string;
    };
    invoices: Array<{
        id: string;
        date: string;
        amount: number;
        currency: string;
        status: string;
        pdf_url: string;
    }>;
}

export interface CheckoutSession {
    id: string;
    url: string;
    payment_status: string;
    success_url: string;
    cancel_url: string;
    plan_id: string;
    amount: number;
    currency: string;
}

export interface CheckoutSession {
    id: string;
    url: string;
    payment_status: string;
    success_url: string;
    cancel_url: string;
    plan_id: string;
    amount: number;
    currency: string;
}

class BackendServiceDev {
    private async makeRequest<T>(
        endpoint: string, 
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${BACKEND_URL}${endpoint}`;
        console.log(`🌐 Making request to: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend request failed: ${response.status} ${errorText}`);
        }

        return response.json();
    }

    async getApiKeys(): Promise<ApiKeyData[]> {
        try {
            console.log('🔑 Fetching API keys from backend...');
            const response = await this.makeRequest<{ api_keys: ApiKeyData[]; success: boolean }>('/v1/api-keys-dev');
            console.log('🔑 API keys response:', response);
            // El endpoint devuelve un objeto con api_keys
            const apiKeys = response.api_keys || [];
            console.log('🔑 Processed API keys:', apiKeys);
            return apiKeys;
        } catch (error) {
            console.error('❌ Error fetching API keys:', error);
            return [];
        }
    }

    async createApiKey(request: CreateApiKeyRequest): Promise<ApiKeyData> {
        const response = await this.makeRequest<{ api_key: ApiKeyData; success: boolean }>('/v1/api-keys-dev', {
            method: 'POST',
            body: JSON.stringify(request),
        });

        return response.api_key;
    }

    async deleteApiKey(keyId: string): Promise<void> {
        await this.makeRequest(`/v1/api-keys-dev/${keyId}`, {
            method: 'DELETE',
        });
    }

    async getApiKeyStats(keyId: string): Promise<any> {
        return this.makeRequest(`/v1/api-keys-dev/${keyId}/stats`);
    }

    async getMetrics(): Promise<BackendMetrics> {
        try {
            return await this.makeRequest<BackendMetrics>('/v1/metrics-dev');
        } catch (error) {
            console.error('Error fetching metrics:', error);
            // Retornar datos por defecto en caso de error
            return {
                metrics: [],
                summary: {
                    total_cost: 0,
                    total_requests: 0,
                    avg_cost_per_request: 0,
                    active_api_keys: 0,
                },
                recent_tasks: []
            };
        }
    }

    async getBilling(): Promise<BillingInfo> {
        try {
            console.log('💳 Fetching billing info...');
            const response = await this.makeRequest<{ billing: BillingInfo; success: boolean }>('/v1/billing-dev');
            console.log('💳 Billing info response:', response);
            return response.billing;
        } catch (error) {
            console.error('❌ Error fetching billing info:', error);
            // Retornar datos por defecto en caso de error
            return {
                current_plan: {
                    id: 'free',
                    name: 'Plan Gratuito',
                    price: 0,
                    currency: 'EUR',
                    billing_cycle: 'monthly',
                    next_billing_date: new Date().toISOString(),
                    status: 'active'
                },
                usage: {
                    current_requests: 0,
                    request_limit: 1000,
                    usage_percentage: 0,
                    total_cost: 0,
                    billing_period_start: new Date().toISOString(),
                    billing_period_end: new Date().toISOString()
                },
                payment_method: {
                    type: 'card',
                    last4: '4242',
                    brand: 'visa',
                    expires: '12/25'
                },
                invoices: []
            };
        }
    }

    async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
        try {
            console.log('🛒 Creating checkout session for plan:', planId);
            const response = await this.makeRequest<{ checkout_session: CheckoutSession; success: boolean }>('/v1/checkout-session-dev', {
                method: 'POST',
                body: JSON.stringify({
                    plan_id: planId,
                    success_url: successUrl,
                    cancel_url: cancelUrl
                })
            });
            console.log('✅ Checkout session created:', response);
            return response.checkout_session;
        } catch (error) {
            console.error('❌ Error creating checkout session:', error);
            throw error;
        }
    }
}

export const backendServiceDev = new BackendServiceDev();