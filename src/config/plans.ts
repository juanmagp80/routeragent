// Configuración de planes de suscripción

export interface Plan {
    id: string;
    name: string;
    price: number; // Precio mensual en USD
    request_limit: number; // Límite de requests por mes (-1 para ilimitado)
    features: string[]; // Lista de características
    model_access: string[]; // Modelos accesibles
    support_level: 'basic' | 'priority' | 'dedicated'; // Nivel de soporte
    webhook_limit: number; // Límite de webhooks por mes (-1 para ilimitado)
    cache_size: number; // Tamaño máximo de cache en MB
    rate_limit: number; // Requests por segundo
    custom_domains: boolean; // Soporte para dominios personalizados
    analytics_depth: 'basic' | 'advanced' | 'full'; // Profundidad de análisis
    sla_guarantee: string; // Garantía de SLA (ej: "99.9%")
    model_routing: boolean; // Ruteo inteligente de modelos
    cost_optimization: boolean; // Optimización de costos
    priority_queue: boolean; // Cola de prioridad para requests
    model_preferences: boolean; // Preferencias de modelo personalizadas
    usage_alerts: boolean; // Alertas de uso
    api_key_limit: number; // Número máximo de API keys (-1 para ilimitado)
}

export const plans: Record<string, Plan> = {
    starter: {
        id: "starter",
        name: "Starter",
        price: 29,
        request_limit: 1000,
        features: [
            "Up to 1,000 API requests/month",
            "Access to GPT-4o Mini and Llama-3",
            "Basic support",
            "Standard analytics",
            "Webhook integrations (100/month)",
            "10MB cache",
            "10 requests/second rate limit",
            "1 API key",
            "Basic usage alerts"
        ],
        model_access: ["gpt-4o-mini", "llama-3"],
        support_level: "basic",
        webhook_limit: 100,
        cache_size: 10,
        rate_limit: 10,
        custom_domains: false,
        analytics_depth: "basic",
        sla_guarantee: "99.5%",
        model_routing: true,
        cost_optimization: true,
        priority_queue: false,
        model_preferences: false,
        usage_alerts: true,
        api_key_limit: 1
    },

    pro: {
        id: "pro",
        name: "Pro",
        price: 99,
        request_limit: 5000,
        features: [
            "Up to 5,000 API requests/month",
            "Access to all AI models including GPT-4o and Claude-3",
            "Priority support",
            "Advanced analytics",
            "Webhook integrations (1,000/month)",
            "100MB cache",
            "100 requests/second rate limit",
            "5 API keys",
            "Advanced usage alerts",
            "Model preference settings",
            "Priority queue for requests"
        ],
        model_access: ["gpt-4o", "gpt-4o-mini", "claude-3", "llama-3"],
        support_level: "priority",
        webhook_limit: 1000,
        cache_size: 100,
        rate_limit: 100,
        custom_domains: false,
        analytics_depth: "advanced",
        sla_guarantee: "99.9%",
        model_routing: true,
        cost_optimization: true,
        priority_queue: true,
        model_preferences: true,
        usage_alerts: true,
        api_key_limit: 5
    },

    enterprise: {
        id: "enterprise",
        name: "Enterprise",
        price: -1, // Precio personalizado
        request_limit: -1, // Ilimitado
        features: [
            "Unlimited API requests",
            "Access to all AI models including premium models",
            "Dedicated support",
            "Full analytics with custom reports",
            "Unlimited webhook integrations",
            "1GB cache",
            "1,000 requests/second rate limit",
            "Unlimited API keys",
            "Custom usage alerts",
            "Full model preference settings",
            "Highest priority queue for requests",
            "Custom domain support",
            "SLA guarantee: 99.99%",
            "Advanced cost optimization",
            "Custom model routing rules"
        ],
        model_access: ["gpt-4o", "gpt-4o-mini", "claude-3", "claude-3.5", "llama-3", "mistral-7b"],
        support_level: "dedicated",
        webhook_limit: -1, // Ilimitado
        cache_size: 1000,
        rate_limit: 1000,
        custom_domains: true,
        analytics_depth: "full",
        sla_guarantee: "99.99%",
        model_routing: true,
        cost_optimization: true,
        priority_queue: true,
        model_preferences: true,
        usage_alerts: true,
        api_key_limit: -1 // Ilimitado
    }
};

// Obtener plan por ID
export function getPlanById(planId: string): Plan | undefined {
    return plans[planId];
}

// Verificar si un modelo está disponible en un plan
export function isModelAvailableInPlan(modelId: string, planId: string): boolean {
    const plan = getPlanById(planId);
    if (!plan) return false;

    return plan.model_access.includes(modelId);
}

// Verificar límites de uso
export function checkUsageLimits(planId: string, currentUsage: number): {
    within_limits: boolean;
    remaining_requests: number;
    usage_percentage: number;
} {
    const plan = getPlanById(planId);
    if (!plan) {
        return {
            within_limits: false,
            remaining_requests: 0,
            usage_percentage: 100
        };
    }

    // Para planes ilimitados
    if (plan.request_limit === -1) {
        return {
            within_limits: true,
            remaining_requests: -1, // Ilimitado
            usage_percentage: 0
        };
    }

    const remaining = plan.request_limit - currentUsage;
    const percentage = (currentUsage / plan.request_limit) * 100;

    return {
        within_limits: remaining >= 0,
        remaining_requests: remaining,
        usage_percentage: percentage
    };
}

// Verificar límites de webhooks
export function checkWebhookLimits(planId: string, currentWebhooks: number): {
    within_limits: boolean;
    remaining_webhooks: number;
    usage_percentage: number;
} {
    const plan = getPlanById(planId);
    if (!plan) {
        return {
            within_limits: false,
            remaining_webhooks: 0,
            usage_percentage: 100
        };
    }

    // Para planes ilimitados
    if (plan.webhook_limit === -1) {
        return {
            within_limits: true,
            remaining_webhooks: -1, // Ilimitado
            usage_percentage: 0
        };
    }

    const remaining = plan.webhook_limit - currentWebhooks;
    const percentage = (currentWebhooks / plan.webhook_limit) * 100;

    return {
        within_limits: remaining >= 0,
        remaining_webhooks: remaining,
        usage_percentage: percentage
    };
}

// Verificar límites de API keys
export function checkApiKeyLimits(planId: string, currentKeys: number): {
    within_limits: boolean;
    remaining_keys: number;
    usage_percentage: number;
} {
    const plan = getPlanById(planId);
    if (!plan) {
        return {
            within_limits: false,
            remaining_keys: 0,
            usage_percentage: 100
        };
    }

    // Para planes ilimitados
    if (plan.api_key_limit === -1) {
        return {
            within_limits: true,
            remaining_keys: -1, // Ilimitado
            usage_percentage: 0
        };
    }

    const remaining = plan.api_key_limit - currentKeys;
    const percentage = (currentKeys / plan.api_key_limit) * 100;

    return {
        within_limits: remaining >= 0,
        remaining_keys: remaining,
        usage_percentage: percentage
    };
}