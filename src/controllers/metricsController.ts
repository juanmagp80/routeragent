export const getMetricsSimple = async (req: any, res: any) => {
    try {
        res.json({
            metrics: [{ model: "gpt-4o", count: 5, sum: 0.15 }],
            summary: { total_cost: 0.15, total_requests: 5, avg_cost_per_request: 0.03, active_api_keys: 1 },
            recent_tasks: [{ model: "gpt-4o", cost: 0.03, latency: 150, status: "completed", timestamp: new Date().toISOString(), task_type: "general" }],
            success: true
        });
    } catch (err) {
        res.status(500).json({ error: "Error", success: false });
    }
};
