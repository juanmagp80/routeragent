// Controlador simplificado para debugging
export const getMetricsSimple = async (req: any, res: any) => {
    console.log('🚀 === INICIO getMetricsSimple ===');

    try {
        console.log('✅ Función ejecutándose correctamente');

        // Devolver datos de prueba simples
        const testResponse = {
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

        console.log('📊 Devolviendo datos de prueba:', testResponse);
        return res.json(testResponse);

    } catch (error) {
        console.error('💥 Error en getMetricsSimple:', error);
        console.error('💥 Stack trace:', error.stack);
        res.status(500).json({
            error: "Failed to fetch metrics",
            success: false,
            details: error.message
        });
    }
};
