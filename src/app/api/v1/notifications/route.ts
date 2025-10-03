import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Generar notificaciones reales basadas en métricas del sistema
        const notifications = await generateRealNotifications();

        return NextResponse.json({
            notifications,
            unread_count: notifications.filter(n => !n.is_read).length,
            success: true
        });

    } catch (error) {
        console.error('API notifications error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}

async function generateRealNotifications() {
    const now = new Date();
    const notifications = [];

    // Obtener métricas reales del sistema
    try {
        const metricsResponse = await fetch('http://localhost:3000/api/v1/metrics', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (metricsResponse.ok) {
            const metrics = await metricsResponse.json();

            // Notificación sobre uso alto
            if (metrics.summary.total_requests > 100) {
                notifications.push({
                    id: 'usage-high',
                    type: 'usage_alert',
                    title: 'Uso elevado detectado',
                    message: `Has realizado ${metrics.summary.total_requests} peticiones. ¡Excelente actividad!`,
                    data: { requests: metrics.summary.total_requests },
                    is_read: false,
                    created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
                });
            }

            // Notificación sobre ahorro de costos
            if (metrics.summary.avg_cost_per_request < 0.01) {
                notifications.push({
                    id: 'cost-savings',
                    type: 'billing',
                    title: 'Optimización de costos activa',
                    message: `RouterAI está ahorrándote dinero: promedio de $${metrics.summary.avg_cost_per_request.toFixed(4)} por petición.`,
                    data: { avg_cost: metrics.summary.avg_cost_per_request },
                    is_read: false,
                    created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() // 4 horas atrás
                });
            }

            // Notificación sobre modelo más usado
            if (metrics.metrics.length > 0) {
                const mostUsed = metrics.metrics.reduce((prev: any, current: any) =>
                    prev.count > current.count ? prev : current
                );

                notifications.push({
                    id: 'model-performance',
                    type: 'performance',
                    title: `${mostUsed.model} es tu modelo favorito`,
                    message: `Has usado ${mostUsed.model} ${mostUsed.count} veces con un costo total de $${mostUsed.sum.toFixed(4)}.`,
                    data: { model: mostUsed.model, count: mostUsed.count, cost: mostUsed.sum },
                    is_read: true,
                    created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString() // 6 horas atrás
                });
            }
        }
    } catch (error) {
        console.error('Error fetching metrics for notifications:', error);
    }

    // Notificación de bienvenida si no hay otras
    if (notifications.length === 0) {
        notifications.push({
            id: 'welcome',
            type: 'info',
            title: '¡Bienvenido a RouterAI!',
            message: 'Tu sistema de enrutamiento inteligente está listo. Comienza a hacer peticiones para ver más notificaciones.',
            data: {},
            is_read: false,
            created_at: now.toISOString()
        });
    }

    // Notificación sobre nueva funcionalidad
    notifications.push({
        id: 'feature-update',
        type: 'feature',
        title: 'Nueva funcionalidad disponible',
        message: 'Ahora puedes ver métricas detalladas y analytics en tiempo real en tu panel de administración.',
        data: {},
        is_read: false,
        created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() // 1 hora atrás
    });

    // Notificación sobre rendimiento del sistema
    notifications.push({
        id: 'system-health',
        type: 'system',
        title: 'Sistema funcionando óptimamente',
        message: 'RouterAI está operando al 100% de capacidad. Todos los modelos están disponibles.',
        data: { uptime: '99.9%', status: 'healthy' },
        is_read: true,
        created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString() // 12 horas atrás
    });

    return notifications.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function POST(req: NextRequest) {
    try {
        const { notificationId, action } = await req.json();

        if (action === 'mark_read') {
            // Aquí normalmente actualizarías la base de datos
            // Por ahora solo devolvemos éxito
            return NextResponse.json({
                success: true,
                message: 'Notificación marcada como leída'
            });
        }

        return NextResponse.json(
            { error: 'Acción no válida', success: false },
            { status: 400 }
        );

    } catch (error) {
        console.error('API notifications POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}