import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '../../../../services/subscriptionService';

const subscriptionService = new SubscriptionService();

export async function GET(req: NextRequest) {
    try {
        // Obtener todos los planes disponibles
        const plans = subscriptionService.getAllPlans();

        return NextResponse.json({
            success: true,
            plans: plans,
            message: "Available subscription plans retrieved successfully"
        });

    } catch (error) {
        console.error('Get plans error:', error);
        return NextResponse.json({
            error: "Failed to retrieve subscription plans",
            success: false
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId, userId } = body;

        // Validar entrada
        if (!planId || !userId) {
            return NextResponse.json({
                error: "Plan ID and User ID are required",
                success: false
            }, { status: 400 });
        }

        // Verificar que el plan existe
        const plan = subscriptionService.getPlanById(planId);
        if (!plan) {
            return NextResponse.json({
                error: "Invalid plan ID",
                success: false
            }, { status: 400 });
        }

        // En una implementación real, aquí se crearía la suscripción en la base de datos
        // y se procesaría el pago si es necesario

        // Simular creación de suscripción
        const subscription = {
            id: `sub_${Date.now()}`,
            user_id: userId,
            plan_id: planId,
            plan_name: plan.name,
            price: plan.price,
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            expires_at: planId === "enterprise" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
            features: plan.features,
            model_access: plan.model_access,
            request_limit: plan.request_limit,
            webhook_limit: plan.webhook_limit,
            cache_size: plan.cache_size,
            rate_limit: plan.rate_limit,
            custom_domains: plan.custom_domains,
            analytics_depth: plan.analytics_depth,
            sla_guarantee: plan.sla_guarantee,
            model_routing: plan.model_routing,
            cost_optimization: plan.cost_optimization,
            priority_queue: plan.priority_queue,
            model_preferences: plan.model_preferences,
            usage_alerts: plan.usage_alerts,
            api_key_limit: plan.api_key_limit
        };

        return NextResponse.json({
            success: true,
            subscription: subscription,
            message: `Subscription to ${plan.name} created successfully`
        });

    } catch (error) {
        console.error('Create subscription error:', error);
        return NextResponse.json({
            error: "Failed to create subscription",
            success: false
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { subscriptionId, planId, userId } = body;

        // Validar entrada
        if (!subscriptionId || !planId || !userId) {
            return NextResponse.json({
                error: "Subscription ID, Plan ID, and User ID are required",
                success: false
            }, { status: 400 });
        }

        // Verificar que el plan existe
        const plan = subscriptionService.getPlanById(planId);
        if (!plan) {
            return NextResponse.json({
                error: "Invalid plan ID",
                success: false
            }, { status: 400 });
        }

        // En una implementación real, aquí se actualizaría la suscripción en la base de datos
        // y se procesaría el pago si es necesario

        // Simular actualización de suscripción
        const updatedSubscription = {
            id: subscriptionId,
            user_id: userId,
            plan_id: planId,
            plan_name: plan.name,
            price: plan.price,
            status: "active",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 1000).toISOString(), // 7 días atrás
            updated_at: new Date().toISOString(),
            expires_at: planId === "enterprise" ? null : new Date(Date.now() + 30 * 24 * 60 * 1000).toISOString(), // 30 días
            features: plan.features,
            model_access: plan.model_access,
            request_limit: plan.request_limit,
            webhook_limit: plan.webhook_limit,
            cache_size: plan.cache_size,
            rate_limit: plan.rate_limit,
            custom_domains: plan.custom_domains,
            analytics_depth: plan.analytics_depth,
            sla_guarantee: plan.sla_guarantee,
            model_routing: plan.model_routing,
            cost_optimization: plan.cost_optimization,
            priority_queue: plan.priority_queue,
            model_preferences: plan.model_preferences,
            usage_alerts: plan.usage_alerts,
            api_key_limit: plan.api_key_limit
        };

        return NextResponse.json({
            success: true,
            subscription: updatedSubscription,
            message: `Subscription updated to ${plan.name} successfully`
        });

    } catch (error) {
        console.error('Update subscription error:', error);
        return NextResponse.json({
            error: "Failed to update subscription",
            success: false
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const subscriptionId = searchParams.get('subscriptionId');
        const userId = searchParams.get('userId');

        // Validar entrada
        if (!subscriptionId || !userId) {
            return NextResponse.json({
                error: "Subscription ID and User ID are required",
                success: false
            }, { status: 400 });
        }

        // En una implementación real, aquí se cancelaría la suscripción en la base de datos

        // Simular cancelación de suscripción
        return NextResponse.json({
            success: true,
            message: `Subscription ${subscriptionId} cancelled successfully`
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json({
            error: "Failed to cancel subscription",
            success: false
        }, { status: 500 });
    }
}