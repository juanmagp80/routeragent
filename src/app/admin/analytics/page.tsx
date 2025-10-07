"use client";

import { Activity, BarChart3, Clock, Cpu, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Interfaz para los datos de métricas
interface MetricsData {
    metrics: Array<{
        model: string;
        count: number;
        sum: number;
    }>;
    summary: {
        total_cost: number;
        total_requests: number;
        avg_cost_per_request: number;
        active_api_keys?: number;
    };
    recent_tasks: Array<{
        model: string;
        cost: number;
        latency: number;
        status: string;
        timestamp: string;
        task_type?: string;
        created_at?: string;
    }>;
}

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            loadAnalytics();
        }
    }, [user, authLoading]);

    const loadAnalytics = async () => {
        const startTime = Date.now();
        console.log('📊 [ANALYTICS] Iniciando carga de analíticas...');
        
        try {
            setLoading(true);

            // Timeout para toda la operación: 6 segundos
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.warn('⏰ [ANALYTICS] Timeout - usando datos por defecto');
                controller.abort();
            }, 6000);

            try {
                // Headers para incluir información del usuario
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };

                if (user?.id) {
                    headers['x-user-id'] = user.id;
                }

                console.log('📡 [ANALYTICS] Consultando endpoint de métricas...');

                // Usar nuestro propio endpoint interno con timeout
                const response = await fetch('/api/v1/metrics', {
                    method: 'GET',
                    headers,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log('� [ANALYTICS] Respuesta recibida:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn('⚠️ [ANALYTICS] Error en endpoint:', response.status, errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const metricsData = await response.json();
                console.log('✅ [ANALYTICS] Datos de analíticas cargados:', {
                    totalRequests: metricsData?.summary?.total_requests || 0,
                    totalCost: metricsData?.summary?.total_cost || 0,
                    metricsCount: metricsData?.metrics?.length || 0,
                    recentTasksCount: metricsData?.recent_tasks?.length || 0
                });
                
                // Validar estructura de datos
                if (!metricsData || typeof metricsData !== 'object') {
                    console.warn('⚠️ [ANALYTICS] Estructura de datos inválida');
                    throw new Error('Estructura de respuesta inválida');
                }
                
                setMetrics(metricsData);

            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                    console.warn('⏰ [ANALYTICS] Operación cancelada por timeout');
                } else {
                    console.warn('⚠️ [ANALYTICS] Error en fetch:', fetchError);
                }
                
                // Usar datos por defecto para usuario nuevo
                setMetrics({
                    metrics: [],
                    summary: {
                        total_cost: 0,
                        total_requests: 0,
                        avg_cost_per_request: 0,
                        active_api_keys: 0,
                    },
                    recent_tasks: []
                });
            }

        } catch (error) {
            console.error('❌ [ANALYTICS] Error general:', error);
            // Datos por defecto en caso de error total
            setMetrics({
                metrics: [],
                summary: {
                    total_cost: 0,
                    total_requests: 0,
                    avg_cost_per_request: 0,
                    active_api_keys: 0,
                },
                recent_tasks: []
            });
        } finally {
            const loadTime = Date.now() - startTime;
            console.log(`⏱️ [ANALYTICS] Carga completada en ${loadTime}ms`);
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-gray-600">Cargando analíticas...</span>
            </div>
        );
    }

    // Calcular estadísticas útiles para el usuario
    const totalRequests = metrics?.summary?.total_requests || 0;
    const activeKeys = metrics?.summary?.active_api_keys || 0;
    const modelCount = metrics?.metrics?.length || 0;

    // Calcular requests por día (estimado)
    const requestsPerDay = Math.round(totalRequests / 7); // Estimado semanal

    // Modelo más usado - con verificación de array vacío y valor inicial
    const mostUsedModel = metrics?.metrics && metrics.metrics.length > 0 
        ? metrics.metrics.reduce((prev, current) =>
            (prev.count > current.count) ? prev : current
        )
        : null;

    // Verificar si el usuario es nuevo (sin datos)
    const isNewUser = totalRequests === 0 && activeKeys === 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <BarChart3 className="mr-3 h-8 w-8 text-emerald-600" />
                        Analytics RouterAI
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {isNewUser 
                            ? "¡Bienvenido! Configura tu primera API Key para comenzar a ver estadísticas"
                            : "Estadísticas detalladas de uso y rendimiento de tus integraciones"
                        }
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

            {/* Mensaje para usuarios nuevos */}
            {isNewUser && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                        <div className="bg-emerald-100 rounded-lg p-3">
                            <Zap className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                ¡Comienza a usar AgentRouter!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Para empezar a ver estadísticas de uso, necesitas crear tu primera API Key y realizar algunas tareas.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-emerald-100 rounded-full w-6 h-6 flex items-center justify-center text-emerald-600 text-sm font-semibold mr-2">1</div>
                                        <h4 className="font-medium text-gray-900">Crear API Key</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Ve a la sección de API Keys y genera tu primera clave
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-emerald-100 rounded-full w-6 h-6 flex items-center justify-center text-emerald-600 text-sm font-semibold mr-2">2</div>
                                        <h4 className="font-medium text-gray-900">Realizar Tareas</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Usa tu API Key para enviar tareas a través de la API
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-emerald-100 rounded-full w-6 h-6 flex items-center justify-center text-emerald-600 text-sm font-semibold mr-2">3</div>
                                        <h4 className="font-medium text-gray-900">Ver Métricas</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Regresa aquí para ver las estadísticas de uso y costos
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={() => window.location.href = '/admin/keys'}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                >
                                    Crear API Key
                                </button>
                                <button
                                    onClick={() => window.open('https://docs.agentrouter.com', '_blank')}
                                    className="bg-white text-emerald-600 border border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                                >
                                    Ver Documentación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    <p className="text-emerald-100 text-xs mt-2">
                        {isNewUser ? "🚀 Comienza usando la API" : "↗️ Todas las integraciones"}
                    </p>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">API Keys Activas</p>
                            <p className="text-3xl font-bold">{activeKeys}</p>
                        </div>
                        <Zap className="h-8 w-8 text-blue-200" />
                    </div>
                    <p className="text-blue-100 text-xs mt-2">
                        {activeKeys === 0 ? "🔑 Crea tu primera API Key" : "🔑 Claves funcionando"}
                    </p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Costo Total</p>
                            <p className="text-3xl font-bold">${(metrics?.summary?.total_cost || 0).toFixed(4)}</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-200" />
                    </div>
                    <p className="text-purple-100 text-xs mt-2">
                        {isNewUser ? "💰 Comenzarás acumulando costos" : "💰 Todas las tareas"}
                    </p>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Modelos IA</p>
                            <p className="text-3xl font-bold">{modelCount}</p>
                        </div>
                        <Cpu className="h-8 w-8 text-orange-200" />
                    </div>
                    <p className="text-orange-100 text-xs mt-2">
                        {modelCount === 0 ? "🤖 Selección automática" : "🤖 Diferentes modelos"}
                    </p>
                </div>
            </div>

            {/* Uso por Modelo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Cpu className="mr-2 h-5 w-5 text-emerald-600" />
                        {isNewUser ? "Modelos Disponibles" : "Uso por Modelo IA"}
                    </h2>
                    {!isNewUser && (
                        <span className="text-sm text-gray-500">
                            {mostUsedModel ? `Más usado: ${mostUsedModel.model}` : 'Sin datos'}
                        </span>
                    )}
                </div>

                {isNewUser ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">GPT-4o</span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Premium</span>
                            </div>
                            <p className="text-sm text-gray-600">Modelo más avanzado para tareas complejas</p>
                            <p className="text-xs text-gray-500 mt-2">~$0.03 por 1K tokens</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">Claude-3</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Equilibrado</span>
                            </div>
                            <p className="text-sm text-gray-600">Excelente para análisis y escritura</p>
                            <p className="text-xs text-gray-500 mt-2">~$0.015 por 1K tokens</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">GPT-4o Mini</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Económico</span>
                            </div>
                            <p className="text-sm text-gray-600">Rápido y eficiente para tareas simples</p>
                            <p className="text-xs text-gray-500 mt-2">~$0.002 por 1K tokens</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">Llama-3</span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Open Source</span>
                            </div>
                            <p className="text-sm text-gray-600">Modelo open source de alta calidad</p>
                            <p className="text-xs text-gray-500 mt-2">~$0.001 por 1K tokens</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {metrics?.metrics && metrics.metrics.length > 0 ? (
                            metrics.metrics
                                .sort((a, b) => b.count - a.count)
                                .map((model, index) => {
                                    const percentage = totalRequests > 0 ? (model.count / totalRequests) * 100 : 0;
                                    return (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{model.model}</p>
                                                    <p className="text-sm text-gray-600">{model.count} requests</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">${model.sum.toFixed(4)}</p>
                                                <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Cpu className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No hay datos de modelos disponibles</p>
                                <p className="text-sm">Realiza algunas tareas para ver las estadísticas</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-emerald-600" />
                        {isNewUser ? "Próximas Tareas" : "Actividad Reciente"}
                    </h2>
                    {!isNewUser && (
                        <span className="text-sm text-gray-500">Últimas {metrics?.recent_tasks?.length || 0} tareas</span>
                    )}
                </div>

                {isNewUser ? (
                    <div className="text-center py-8">
                        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-6 max-w-md mx-auto">
                            <Clock className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tus tareas aparecerán aquí</h3>
                            <p className="text-gray-600 mb-4">Una vez que comiences a usar la API, verás:</p>
                            <div className="text-left space-y-2">
                                <div className="flex items-center text-sm text-gray-700">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                    Modelo de IA utilizado
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                    Costo de cada tarea
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                    Tiempo de respuesta
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                    Estado de la tarea
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {metrics?.recent_tasks && metrics.recent_tasks.length > 0 ? (
                            metrics.recent_tasks.map((task, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            task.status === 'completed' ? 'bg-green-500' : 
                                            task.status === 'pending' ? 'bg-yellow-500' : 
                                            'bg-red-500'
                                        }`}></div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{task.model}</p>
                                            <p className="text-sm text-gray-600">
                                                {task.task_type || 'general'} • {task.latency}ms
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">${task.cost.toFixed(4)}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(task.timestamp).toLocaleDateString('es-ES', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No hay actividad reciente</p>
                                <p className="text-sm">Las tareas aparecerán aquí cuando uses la API</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}