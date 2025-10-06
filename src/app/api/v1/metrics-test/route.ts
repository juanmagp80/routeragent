import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        console.log('🔍 Testing metrics endpoint...');

        // Datos de prueba simples para verificar que el endpoint funciona
        const testMetrics = {
            metrics: [
                { model: 'gpt-4o', count: 5, sum: 0.15 },
                { model: 'claude-3', count: 3, sum: 0.045 }
            ],
            summary: {
                total_cost: 0.195,
                total_requests: 8,
                avg_cost_per_request: 0.024,
                active_api_keys: 1
            },
            recent_tasks: [
                {
                    model: 'gpt-4o',
                    cost: 0.03,
                    latency: 150,
                    status: 'completed',
                    timestamp: new Date().toISOString(),
                    task_type: 'general'
                }
            ],
            success: true
        };

        console.log('✅ Test metrics returned successfully');
        return NextResponse.json(testMetrics);

    } catch (error) {
        console.error('❌ Test metrics error:', error);
        return NextResponse.json(
            { error: 'Test endpoint error', success: false, details: error.message },
            { status: 500 }
        );
    }
}
