import { NextRequest, NextResponse } from 'next/server';
import { getQuickMetrics } from '../../../services/quickMetrics';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || '761ce82d-0f07-4f70-9b63-987a668b0907';

        console.log('⚡ [QUICK-DASHBOARD] Cargando métricas para:', userId);

        const quickData = await getQuickMetrics(userId);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            userId,
            metrics: quickData,
            dashboard_display: {
                usage_text: `${quickData.requests} / 1,000`,
                percentage: Math.min((quickData.requests / 1000) * 100, 100),
                total_cost: quickData.cost.toFixed(6),
                api_keys_count: quickData.apiKeysCount,
                is_new_user: quickData.requests === 0 && quickData.apiKeysCount === 0
            }
        });

    } catch (error) {
        console.error('💥 Error en quick-dashboard:', error);
        return NextResponse.json({ 
            error: 'Error cargando métricas rápidas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}