// Controlador de rutas para AgentRouter

export const routeTask = async (req: any, res: any) => {
    try {
        const task = req.body;

        // Validar entrada
        if (!task.input) {
            return res.status(400).json({
                error: "Input is required",
                success: false
            });
        }

        // Asignar ID único si no existe
        if (!task.id) {
            task.id = Date.now().toString();
        }

        // Simular ruteo inteligente
        const models = [
            { name: "GPT-4o", cost: 0.03, speed: 8, quality: 9 },
            { name: "Claude-3", cost: 0.015, speed: 7, quality: 8 },
            { name: "GPT-4o Mini", cost: 0.002, speed: 9, quality: 7 },
            { name: "Llama-3", cost: 0.001, speed: 6, quality: 6 }
        ];

        // Seleccionar modelo óptimo basado en tipo de tarea
        let selectedModel;
        if (task.input.toLowerCase().includes("resume") || task.input.toLowerCase().includes("summarize")) {
            // Para resúmenes, priorizar velocidad y costo
            selectedModel = models.find(m => m.name === "GPT-4o Mini") || models[0];
        } else if (task.input.toLowerCase().includes("translate") || task.input.toLowerCase().includes("traducir")) {
            // Para traducciones, priorizar calidad
            selectedModel = models.find(m => m.name === "Claude-3") || models[1];
        } else {
            // Para tareas generales, balance
            selectedModel = models.find(m => m.name === "GPT-4o") || models[0];
        }

        // Calcular costo y tiempo estimado
        const cost = selectedModel.cost * (task.input.length / 1000);
        const estimatedTime = 1000 / selectedModel.speed;

        // Simular respuesta de IA
        const responseText = `Respuesta generada usando ${selectedModel.name}. 
Costo estimado: $${cost.toFixed(3)}
Tiempo estimado: ${Math.round(estimatedTime)}ms`;

        res.json({
            selected_model: selectedModel.name,
            cost: cost,
            estimated_time: Math.round(estimatedTime),
            response: responseText,
            task_type: task.input.toLowerCase().includes("resume") || task.input.toLowerCase().includes("summarize") ? "summary" :
                task.input.toLowerCase().includes("translate") || task.input.toLowerCase().includes("traducir") ? "translation" : "general",
            success: true
        });

    } catch (error) {
        console.error('Routing error:', error);
        res.status(500).json({
            error: "Internal server error",
            success: false
        });
    }
};

export const getMetrics = async (req: any, res: any) => {
    try {
        // Simular métricas
        const mockMetrics = [
            {
                model: "gpt-4o",
                count: 45,
                sum: 0.675
            },
            {
                model: "claude-3",
                count: 23,
                sum: 0.69
            },
            {
                model: "gpt-4o-mini",
                count: 67,
                sum: 0.134
            },
            {
                model: "llama-3",
                count: 89,
                sum: 0.089
            }
        ];

        // Calcular resumen
        const totalCost = mockMetrics.reduce((sum, m) => sum + (m.sum || 0), 0);
        const totalRequests = mockMetrics.reduce((sum, m) => sum + (m.count || 0), 0);
        const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

        const summary = {
            total_cost: totalCost,
            total_requests: totalRequests,
            avg_cost_per_request: avgCostPerRequest
        };

        // Simular tareas recientes
        const recentTasks = [
            {
                model: "claude-3",
                cost: 0.015,
                latency: 89,
                status: "completed",
                timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
            },
            {
                model: "gpt-4",
                cost: 0.032,
                latency: 156,
                status: "completed",
                timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
            },
            {
                model: "mistral-7b",
                cost: 0.002,
                latency: 167,
                status: "completed",
                timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString()
            },
            {
                model: "llama-3",
                cost: 0.001,
                latency: 234,
                status: "completed",
                timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
            }
        ];

        res.json({
            metrics: mockMetrics,
            summary,
            recent_tasks: recentTasks,
            success: true
        });

    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).json({
            error: "Failed to fetch metrics",
            success: false
        });
    }
};