// Servicio de suscripción para AgentRouter

import { Plan, plans } from '../config/plans';

export class SubscriptionService {
    // Obtener todos los planes disponibles
    getAllPlans(): Plan[] {
        return Object.values(plans);
    }

    // Obtener un plan específico por ID
    getPlanById(planId: string): Plan | undefined {
        return plans[planId];
    }

    // Verificar si un modelo está disponible en un plan
    isModelAvailableInPlan(modelId: string, planId: string): boolean {
        const plan = this.getPlanById(planId);
        if (!plan) return false;

        return plan.model_access.includes(modelId);
    }

    // Verificar límites de uso para un plan
    checkUsageLimits(planId: string, currentUsage: number): {
        within_limits: boolean;
        remaining_requests: number;
        usage_percentage: number;
    } {
        const plan = this.getPlanById(planId);
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

    // Verificar límites de webhooks para un plan
    checkWebhookLimits(planId: string, currentWebhooks: number): {
        within_limits: boolean;
        remaining_webhooks: number;
        usage_percentage: number;
    } {
        const plan = this.getPlanById(planId);
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

    // Verificar límites de API keys para un plan
    checkApiKeyLimits(planId: string, currentKeys: number): {
        within_limits: boolean;
        remaining_keys: number;
        usage_percentage: number;
    } {
        const plan = this.getPlanById(planId);
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

    // Verificar si un usuario puede acceder a un modelo específico
    canAccessModel(userId: string, modelId: string, planId: string): boolean {
        // En una implementación real, esto verificaría la suscripción del usuario
        // Por ahora, simplemente verificamos si el modelo está disponible en el plan
        return this.isModelAvailableInPlan(modelId, planId);
    }

    // Verificar si un usuario puede hacer una solicitud basada en sus límites
    canMakeRequest(userId: string, planId: string, currentUsage: number): boolean {
        const limits = this.checkUsageLimits(planId, currentUsage);
        return limits.within_limits;
    }

    // Verificar si un usuario puede crear un webhook basado en sus límites
    canCreateWebhook(userId: string, planId: string, currentWebhooks: number): boolean {
        const limits = this.checkWebhookLimits(planId, currentWebhooks);
        return limits.within_limits;
    }

    // Verificar si un usuario puede crear una API key basado en sus límites
    canCreateApiKey(userId: string, planId: string, currentKeys: number): boolean {
        const limits = this.checkApiKeyLimits(planId, currentKeys);
        return limits.within_limits;
    }

    // Obtener características de un plan
    getPlanFeatures(planId: string): string[] {
        const plan = this.getPlanById(planId);
        return plan ? plan.features : [];
    }

    // Obtener nivel de soporte de un plan
    getSupportLevel(planId: string): 'basic' | 'priority' | 'dedicated' | undefined {
        const plan = this.getPlanById(planId);
        return plan ? plan.support_level : undefined;
    }

    // Verificar si un plan tiene dominios personalizados
    hasCustomDomains(planId: string): boolean {
        const plan = this.getPlanById(planId);
        return plan ? plan.custom_domains : false;
    }

    // Obtener profundidad de análisis de un plan
    getAnalyticsDepth(planId: string): 'basic' | 'advanced' | 'full' | undefined {
        const plan = this.getPlanById(planId);
        return plan ? plan.analytics_depth : undefined;
    }

    // Verificar garantía de SLA de un plan
    getSlaGuarantee(planId: string): string | undefined {
        const plan = this.getPlanById(planId);
        return plan ? plan.sla_guarantee : undefined;
    }

    // Verificar si un plan tiene ruteo de modelos
    hasModelRouting(planId: string): boolean {
        const plan = this.getPlanById(planId);
        return plan ? plan.model_routing : false;
    }

    // Verificar si un plan tiene optimización de costos
    hasCostOptimization(planId: string): boolean {
        const plan = this.getPlanById(planId);
        return plan ? plan.cost_optimization : false;
    }

    // Verificar si un plan tiene cola de prioridad
    hasPriorityQueue(planId: string): boolean {
        const plan = this.getPlanById(planId);
        return plan ? plan.priority_queue : false;
    }

    // Verificar si un plan tiene preferencias de modelo
    hasModelPreferences(planId: string): boolean {
        const plan = this.getPlanById(planId);
        return plan ? plan.model_preferences : false;
    }

    // Verificar si un plan tiene alertas de uso
    hasUsageAlerts(planId: string): boolean {
        const plan = this.getPlanById(planId);
        return plan ? plan.usage_alerts : false;
    }

    // Obtener límite de API keys de un plan
    getApiKeyLimit(planId: string): number {
        const plan = this.getPlanById(planId);
        return plan ? plan.api_key_limit : 0;
    }

    // Obtener límite de requests por segundo de un plan
    getRateLimit(planId: string): number {
        const plan = this.getPlanById(planId);
        return plan ? plan.rate_limit : 0;
    }

    // Obtener tamaño de cache de un plan
    getCacheSize(planId: string): number {
        const plan = this.getPlanById(planId);
        return plan ? plan.cache_size : 0;
    }

    // Obtener límite de webhooks de un plan
    getWebhookLimit(planId: string): number {
        const plan = this.getPlanById(planId);
        return plan ? plan.webhook_limit : 0;
    }

    // Obtener límite de requests de un plan
    getRequestLimit(planId: string): number {
        const plan = this.getPlanById(planId);
        return plan ? plan.request_limit : 0;
    }

    // Obtener precio de un plan
    getPrice(planId: string): number {
        const plan = this.getPlanById(planId);
        return plan ? plan.price : 0;
    }

    // Obtener nombre de un plan
    getName(planId: string): string {
        const plan = this.getPlanById(planId);
        return plan ? plan.name : "";
    }

    // Obtener modelos accesibles de un plan
    getModelAccess(planId: string): string[] {
        const plan = this.getPlanById(planId);
        return plan ? plan.model_access : [];
    }

    // Verificar si un plan es ilimitado
    isUnlimited(planId: string): boolean {
        const plan = this.getPlanById(planId);
        return plan ? plan.request_limit === -1 : false;
    }

    // Comparar dos planes
    comparePlans(planId1: string, planId2: string): {
        plan1: Plan | undefined;
        plan2: Plan | undefined;
        differences: string[];
    } {
        const plan1 = this.getPlanById(planId1);
        const plan2 = this.getPlanById(planId2);

        if (!plan1 || !plan2) {
            return {
                plan1,
                plan2,
                differences: []
            };
        }

        const differences: string[] = [];

        if (plan1.price !== plan2.price) {
            differences.push(`Price: $${plan1.price} vs $${plan2.price}`);
        }

        if (plan1.request_limit !== plan2.request_limit) {
            differences.push(`Request limit: ${plan1.request_limit === -1 ? 'Unlimited' : plan1.request_limit} vs ${plan2.request_limit === -1 ? 'Unlimited' : plan2.request_limit}`);
        }

        if (plan1.model_access.length !== plan2.model_access.length) {
            differences.push(`Model access: ${plan1.model_access.length} models vs ${plan2.model_access.length} models`);
        }

        if (plan1.support_level !== plan2.support_level) {
            differences.push(`Support level: ${plan1.support_level} vs ${plan2.support_level}`);
        }

        if (plan1.webhook_limit !== plan2.webhook_limit) {
            differences.push(`Webhook limit: ${plan1.webhook_limit === -1 ? 'Unlimited' : plan1.webhook_limit} vs ${plan2.webhook_limit === -1 ? 'Unlimited' : plan2.webhook_limit}`);
        }

        if (plan1.cache_size !== plan2.cache_size) {
            differences.push(`Cache size: ${plan1.cache_size}MB vs ${plan2.cache_size}MB`);
        }

        if (plan1.rate_limit !== plan2.rate_limit) {
            differences.push(`Rate limit: ${plan1.rate_limit} req/sec vs ${plan2.rate_limit} req/sec`);
        }

        if (plan1.custom_domains !== plan2.custom_domains) {
            differences.push(`Custom domains: ${plan1.custom_domains ? 'Yes' : 'No'} vs ${plan2.custom_domains ? 'Yes' : 'No'}`);
        }

        if (plan1.analytics_depth !== plan2.analytics_depth) {
            differences.push(`Analytics depth: ${plan1.analytics_depth} vs ${plan2.analytics_depth}`);
        }

        if (plan1.sla_guarantee !== plan2.sla_guarantee) {
            differences.push(`SLA guarantee: ${plan1.sla_guarantee} vs ${plan2.sla_guarantee}`);
        }

        if (plan1.model_routing !== plan2.model_routing) {
            differences.push(`Model routing: ${plan1.model_routing ? 'Yes' : 'No'} vs ${plan2.model_routing ? 'Yes' : 'No'}`);
        }

        if (plan1.cost_optimization !== plan2.cost_optimization) {
            differences.push(`Cost optimization: ${plan1.cost_optimization ? 'Yes' : 'No'} vs ${plan2.cost_optimization ? 'Yes' : 'No'}`);
        }

        if (plan1.priority_queue !== plan2.priority_queue) {
            differences.push(`Priority queue: ${plan1.priority_queue ? 'Yes' : 'No'} vs ${plan2.priority_queue ? 'Yes' : 'No'}`);
        }

        if (plan1.model_preferences !== plan2.model_preferences) {
            differences.push(`Model preferences: ${plan1.model_preferences ? 'Yes' : 'No'} vs ${plan2.model_preferences ? 'Yes' : 'No'}`);
        }

        if (plan1.usage_alerts !== plan2.usage_alerts) {
            differences.push(`Usage alerts: ${plan1.usage_alerts ? 'Yes' : 'No'} vs ${plan2.usage_alerts ? 'Yes' : 'No'}`);
        }

        if (plan1.api_key_limit !== plan2.api_key_limit) {
            differences.push(`API key limit: ${plan1.api_key_limit === -1 ? 'Unlimited' : plan1.api_key_limit} vs ${plan2.api_key_limit === -1 ? 'Unlimited' : plan2.api_key_limit}`);
        }

        return {
            plan1,
            plan2,
            differences
        };
    }
}