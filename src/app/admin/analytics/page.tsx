"use client";

import { BackendMetrics, backendServiceDev } from "@/services/backendServiceDev";
import { Activity, BarChart3, Clock, Cpu, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<BackendMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            console.log('📊 Loading analytics...');
            setLoading(true);
            const metricsData = await backendServiceDev.getMetrics();
            console.log('✅ Analytics loaded:', metricsData);
            setMetrics(metricsData);
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
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

    // Calcular estadísticas útiles para el usuario
    const totalRequests = metrics?.summary?.total_requests || 0;
    const activeKeys = metrics?.summary?.active_api_keys || 0;
    const modelCount = metrics?.metrics?.length || 0;

    // Calcular requests por día (estimado)
    const requestsPerDay = Math.round(totalRequests / 7); // Estimado semanal

    // Modelo más usado
    const mostUsedModel = metrics?.metrics?.reduce((prev, current) =>
        (prev.count > current.count) ? prev : current
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <BarChart3 className="mr-3 h-8 w-8 text-emerald-600" />
                        Analytics RouterAI
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Estadísticas detalladas de uso y rendimiento de tus integraciones
                    </p>
                </div>
                <button
                    onClick={loadAnalytics}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Activity className="mr-2 h-4 w-4" />
                    Actualizar
                </button>
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Total Requests</p>
                            <p className="text-3xl font-bold">{totalRequests.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-emerald-200" />
                    </div>
                    <p className="text-emerald-100 text-xs mt-2">↗️ Todas las integraciones</p>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Promedio Diario</p>
                            <p className="text-3xl font-bold">{requestsPerDay.toLocaleString()}</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-200" />
                    </div>
                    <p className="text-blue-100 text-xs mt-2">📊 Últimos 7 días</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">APIs Activas</p>
                            <p className="text-3xl font-bold">{activeKeys}</p>
                        </div>
                        <Zap className="h-8 w-8 text-purple-200" />
                    </div>
                    <p className="text-purple-100 text-xs mt-2">🔑 Claves funcionando</p>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Modelos IA</p>
                            <p className="text-3xl font-bold">{modelCount}</p>
                        </div>
                        <Cpu className="h-8 w-8 text-orange-200" />
                    </div>
                    <p className="text-orange-100 text-xs mt-2">🤖 Diferentes modelos</p>
                </div>
            </div>

            {/* Uso por Modelo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Cpu className="mr-2 h-5 w-5 text-emerald-600" />
                        Distribución por Modelo IA
                    </h2>
                    {mostUsedModel && (
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Más usado</p>
                            <p className="font-semibold text-emerald-600">{mostUsedModel.model}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {metrics?.metrics && metrics.metrics.length > 0 ? (
                        metrics.metrics
                            .sort((a, b) => b.count - a.count)
                            .map((model, index) => {
                                const percentage = totalRequests > 0 ? (model.count / totalRequests) * 100 : 0;
                                return (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${index === 0 ? 'bg-emerald-500' :
                                                    index === 1 ? 'bg-blue-500' :
                                                        index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                                                }`}></div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{model.model}</p>
                                                <p className="text-sm text-gray-600">{model.count.toLocaleString()} requests</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-gray-900">{percentage.toFixed(1)}%</p>
                                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className={`h-2 rounded-full ${index === 0 ? 'bg-emerald-500' :
                                                            index === 1 ? 'bg-blue-500' :
                                                                index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                                                        }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    ) : (
                        <div className="text-center py-12">
                            <Cpu className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin datos de modelos</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Comienza usando RouterAI para ver estadísticas de modelos
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-emerald-600" />
                    Actividad Reciente
                </h2>

                <div className="space-y-3">
                    {metrics?.recent_tasks && metrics.recent_tasks.length > 0 ? (
                        metrics.recent_tasks.slice(0, 10).map((task, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                                        <Zap className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{task.model}</p>
                                        <p className="text-sm text-gray-600 capitalize">{task.task_type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        {new Date(task.created_at).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(task.created_at).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Clock className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin actividad reciente</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Las requests aparecerán aquí cuando comiences a usar RouterAI
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}