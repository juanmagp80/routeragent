import { NextRequest, NextResponse } from 'next/server';
import { getUserMetrics, getUserStats } from '../../../services/userMetrics';

export async function GET() {
    try {
        // Usuario que SÍ tiene registros según debug anterior
        const testUserId = '761ce82d-0f07-4f70-9b63-987a668b0907';
        
        console.log('🧪 Testing métricas para usuario con datos:', testUserId);

        const [userMetrics, userStats] = await Promise.all([
            getUserMetrics(testUserId),
            getUserStats(testUserId)
        ]);

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            test_user_id: testUserId,
            userMetrics,
            userStats,
            analysis: {
                total_requests: userMetrics.totalRequests,
                total_cost: userMetrics.totalCost,
                api_keys_count: userMetrics.apiKeysCount,
                recent_activity_count: userMetrics.recentActivity.length
            }
        });

    } catch (error) {
        console.error('💥 Error en force-metrics:', error);
        return NextResponse.json({ 
            error: 'Error en test forzado',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}