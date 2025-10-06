// Controlador para analytics - versión funcional
export const getAnalyticsData = async (req: any, res: any) => {
    console.log('🚀 Iniciando getAnalyticsData');
    
    try {
        const response = {
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

        console.log('✅ Devolviendo datos:', response);
        return res.json(response);

    } catch (error: unknown) {
        console.error('❌ Error:', error);
        res.status(500).json({
            error: "Failed to fetch analytics",
            success: false,
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
