import {
    Alert,
    AlertSeverity,
    AlertType,
    PerformanceMetrics
} from '../config/monitoring';

export class MonitoringService {
    private alerts: Alert[] = [];
    private metricsBuffer: PerformanceMetrics[] = [];

    constructor() {
        // Iniciar recolección de métricas del sistema
        this.startSystemMetricsCollection();
    }

    // Iniciar recolección de métricas del sistema
    private startSystemMetricsCollection() {
        setInterval(async () => {
            try {
                const performanceMetrics: PerformanceMetrics = {
                    system: {
                        cpu_usage: Math.random() * 100,
                        memory_usage: Math.random() * 100,
                        disk_usage: Math.random() * 100,
                        network_in: Math.floor(Math.random() * 1000000),
                        network_out: Math.floor(Math.random() * 1000000),
                        uptime: process.uptime(),
                        timestamp: new Date()
                    },
                    app: {
                        total_cost: Math.random() * 1000,
                        total_requests: Math.floor(Math.random() * 10000),
                        successful_requests: Math.floor(Math.random() * 9500),
                        failed_requests: Math.floor(Math.random() * 500),
                        avg_response_time: Math.floor(Math.random() * 1000),
                        avg_cost_per_request: Math.random() * 0.1,
                        cache_hit_rate: Math.random() * 100,
                        model_distribution: {
                            'gpt-4o': Math.floor(Math.random() * 5000),
                            'claude-3': Math.floor(Math.random() * 3000),
                            'gpt-4o-mini': Math.floor(Math.random() * 2000)
                        },
                        timestamp: new Date()
                    },
                    users: [],
                    models: [],
                    cache: {
                        size: Math.floor(Math.random() * 1000),
                        maxSize: 10000,
                        hitRate: Math.random() * 100,
                        missRate: Math.random() * 100,
                        evictionCount: Math.floor(Math.random() * 100),
                        timestamp: new Date()
                    },
                    api_keys: [],
                    timestamp: new Date()
                };

                this.metricsBuffer.push(performanceMetrics);

                // Verificar umbrales y generar alertas
                this.checkThresholds(performanceMetrics);

            } catch (error) {
                console.error('Error collecting system metrics:', error);
            }
        }, 60000); // Cada minuto
    }

    // Verificar umbrales y generar alertas
    private checkThresholds(metrics: PerformanceMetrics) {
        // Verificar costo alto por request
        if (metrics.app.avg_cost_per_request > 0.10) {
            this.createAlert(
                'HIGH_COST_PER_REQUEST',
                'HIGH',
                `Average cost per request is too high: $${metrics.app.avg_cost_per_request.toFixed(4)}. Consider optimizing model selection.`
            );
        }

        // Verificar latencia alta
        if (metrics.app.avg_response_time > 5000) {
            this.createAlert(
                'HIGH_LATENCY',
                'MEDIUM',
                `Average response time is too high: ${metrics.app.avg_response_time}ms. Check model performance.`
            );
        }

        // Verificar tasa de error alta
        const errorRate = metrics.app.failed_requests / metrics.app.total_requests;
        if (errorRate > 0.05) {
            this.createAlert(
                'HIGH_ERROR_RATE',
                'HIGH',
                `Error rate is too high: ${(errorRate * 100).toFixed(2)}%. Investigate failing requests.`
            );
        }

        // Verificar tasa de cache miss alta
        if (metrics.cache.missRate > 50) {
            this.createAlert(
                'CACHE_MISS_RATE_HIGH',
                'MEDIUM',
                `Cache miss rate is too high: ${metrics.cache.missRate.toFixed(2)}%. Consider adjusting cache strategy.`
            );
        }
    }

    // Crear una nueva alerta
    private createAlert(type: AlertType, severity: AlertSeverity, message: string, metadata?: Record<string, any>) {
        const alert: Alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            message,
            timestamp: new Date(),
            resolved: false,
            metadata
        };

        this.alerts.push(alert);
        console.log(`🔔 New alert: ${type} - ${message}`);
    }

    // Obtener alertas activas
    public getActiveAlerts(): Alert[] {
        return this.alerts.filter(alert => !alert.resolved);
    }

    // Marcar alerta como resuelta
    public resolveAlert(alertId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            return true;
        }
        return false;
    }

    // Obtener estadísticas de alertas
    public getAlertStats(): {
        total_alerts: number;
        active_alerts: number;
        resolved_alerts: number;
    } {
        const activeAlerts = this.getActiveAlerts();
        const resolvedAlerts = this.alerts.filter(alert => alert.resolved);

        return {
            total_alerts: this.alerts.length,
            active_alerts: activeAlerts.length,
            resolved_alerts: resolvedAlerts.length
        };
    }
}