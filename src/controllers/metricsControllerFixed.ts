// Controlador simplificado para debugging de métricas
export const getMetricsSimple = async (req: any, res: any) => {
    console.log('🚀 === INICIO getMetricsSimple ===');

    try {
        console.log('✅ Función ejecutándose correctamente');

        // Devolver datos de prueba simples que funcionan
        const testResponse = {
            metrics: [
                { model: 'gpt-4o', count: 5, sum: 0.15 },
                { model: 'claude-3', count: 3, sum: 0.045 },
                { model: 'gpt-4o-mini', count: 2, sum: 0.004 }
            ],
            summary: {
                total_cost: 0.199,
                total_requests: 10,
                avg_cost_per_request: 0.0199,
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
                },
                {
                    model: 'claude-3',
                    cost: 0.015,
                    latency: 95,
                    status: 'completed',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    task_type: 'analysis'
                }
            ],
            success: true
        };

        console.log('📊 Devolviendo datos de prueba:', testResponse);
        return res.json(testResponse);

    } catch (error: unknown) {
        console.error('💥 Error en getMetricsSimple:', error);
        console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            error: "Failed to fetch metrics",
            success: false,
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
