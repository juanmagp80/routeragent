"use client";

import { useEffect, useState } from "react";
import { backendServiceDev, BackendMetrics } from "@/services/backendServiceDev";

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<BackendMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            console.log('📊 Loading metrics...');
            setLoading(true);
            const metricsData = await backendServiceDev.getMetrics();
            console.log('✅ Metrics loaded:', metricsData);
            setMetrics(metricsData);
        } catch (error) {
            console.error('❌ Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="mt-1 text-sm text-gray-600">
                ¡Bienvenido de nuevo! Aquí tienes un resumen de tu cuenta AgentRouter.
            </p>

            <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Resumen de la Cuenta</h2>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500">Costo Total</h3>
                            <p className="text-2xl font-semibold text-gray-900">€{metrics?.summary.total_cost.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500">Total de Requests</h3>
                            <p className="text-2xl font-semibold text-gray-900">{metrics?.summary.total_requests.toLocaleString() || '0'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500">Costo Promedio/Request</h3>
                            <p className="text-2xl font-semibold text-gray-900">€{metrics?.summary.avg_cost_per_request.toFixed(4) || '0.0000'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500">Claves API Activas</h3>
                            <p className="text-2xl font-semibold text-gray-900">{metrics?.summary.active_api_keys || '0'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
                    <div className="mt-4 space-y-4">
                        {metrics?.recent_tasks && metrics.recent_tasks.length > 0 ? (
                            metrics.recent_tasks.map((task, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{task.model}</p>
                                        <p className="text-sm text-gray-500">{task.task_type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">€{task.cost.toFixed(4)}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(task.created_at).toLocaleString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No hay actividad reciente</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}