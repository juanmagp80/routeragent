import { getUserMetrics, getUserStats } from '@/services/userMetrics';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const userId = '761ce82d-0f07-4f70-9b63-987a668b0907'; // Tu user ID

        console.log('🔍 [METRICS-DEBUG] Obteniendo métricas para:', userId);

        // Obtener métricas usando las funciones del dashboard
        const [userMetrics, userStats] = await Promise.allSettled([
            getUserMetrics(userId),
            getUserStats(userId)
        ]);

        console.log('📊 [METRICS-DEBUG] Resultados:');
        console.log('- getUserMetrics:', userMetrics);
        console.log('- getUserStats:', userStats);

        return NextResponse.json({
            success: true,
            userId,
            userMetrics: userMetrics.status === 'fulfilled' ? userMetrics.value : { error: userMetrics.reason },
            userStats: userStats.status === 'fulfilled' ? userStats.value : { error: userStats.reason },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [METRICS-DEBUG] Error:', error);
        return NextResponse.json({
            error: 'Error obteniendo métricas de debug',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}