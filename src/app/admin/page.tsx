"use client";

import { BackendMetrics, backendServiceDev } from "@/services/backendServiceDev";
import { BarChart3, DollarSign, Key, Sparkles, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../config/database";

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<BackendMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        checkUserAndLoadMetrics();
    }, []);

    const checkUserAndLoadMetrics = async () => {
        try {
            console.log('� Checking user status...');
            setLoading(true);

            // Verificar si el usuario está autenticado
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error('No authenticated user found:', authError);
                return;
            }

            // Buscar información del usuario en nuestra base de datos
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('Error fetching user data:', userError);
                return;
            }

            setUserInfo(userData);

            // Verificar si el usuario tiene API keys (para determinar si es nuevo)
            const { data: apiKeys, error: keysError } = await supabase
                .from('api_keys')
                .select('id')
                .eq('user_id', user.id);

            if (keysError) {
                console.error('Error checking API keys:', keysError);
            }

            // Si no tiene API keys o fue creado recientemente, es un usuario nuevo
            const isRecentUser = userData.created_at &&
                new Date(userData.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
            const hasNoApiKeys = !apiKeys || apiKeys.length === 0;

            if (isRecentUser && hasNoApiKeys) {
                console.log('🎉 New user detected!');
                setIsNewUser(true);
            } else {
                console.log('📊 Loading metrics for existing user...');
                const metricsData = await backendServiceDev.getMetrics();
                console.log('✅ Metrics loaded:', metricsData);
                setMetrics(metricsData);
            }
        } catch (error) {
            console.error('❌ Error checking user status:', error);
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

    // Dashboard para usuarios nuevos
    if (isNewUser) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Bienvenida */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-lg text-white overflow-hidden">
                    <div className="px-8 py-12">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-white/20 rounded-full p-3">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    ¡Bienvenido a RouterAI, {userInfo?.name}!
                                </h1>
                                <p className="text-emerald-100 mt-2">
                                    Tu cuenta ha sido creada exitosamente. Ahora puedes empezar a usar nuestros servicios de IA.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primeros pasos */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-emerald-100 rounded-full p-3">
                                <Key className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">1. Crear API Key</h3>
                                <p className="text-sm text-gray-600">Genera tu primera clave de API</p>
                            </div>
                        </div>
                        <a
                            href="/admin/keys"
                            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Crear API Key →
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-blue-100 rounded-full p-3">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">2. Probar API</h3>
                                <p className="text-sm text-gray-600">Realiza tu primera llamada</p>
                            </div>
                        </div>
                        <a
                            href="/admin/test-api"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Probar API →
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-purple-100 rounded-full p-3">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">3. Configurar Perfil</h3>
                                <p className="text-sm text-gray-600">Personaliza tu cuenta</p>
                            </div>
                        </div>
                        <a
                            href="/admin/settings"
                            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Configurar →
                        </a>
                    </div>
                </div>

                {/* Información de plan */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Plan Actual</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">Plan Gratuito</p>
                            <p className="text-gray-600">1,000 llamadas mensuales incluidas</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Uso actual</p>
                            <p className="text-2xl font-semibold text-gray-900">0 / 1,000</p>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Panel de administración</h1>
                            <p className="text-gray-600 mt-1">
                                Gestiona tu cuenta y supervisa el uso de RouterAI
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Métricas del Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total requests</p>
                            <p className="text-2xl font-semibold text-gray-900">{metrics?.summary.total_requests.toLocaleString() || '0'}</p>
                        </div>
                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                            <BarChart3 className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">Consultas procesadas</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Claves API</p>
                            <p className="text-2xl font-semibold text-gray-900">{metrics?.summary.active_api_keys || '0'}</p>
                        </div>
                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                            <Key className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">Claves activas</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Rendimiento</p>
                            <p className="text-2xl font-semibold text-gray-900">98.5%</p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                            <TrendingUp className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">Tiempo de actividad</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Respuesta</p>
                            <p className="text-2xl font-semibold text-gray-900">1.2s</p>
                        </div>
                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                            <DollarSign className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">Tiempo promedio</p>
                    </div>
                </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Actividad reciente</h2>
                    <p className="text-gray-600 text-sm">Últimas consultas procesadas</p>
                </div>

                <div className="p-6">
                    {metrics?.recent_tasks && metrics.recent_tasks.length > 0 ? (
                        <div className="space-y-3">
                            {metrics.recent_tasks.map((task, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{task.model}</p>
                                            <p className="text-sm text-gray-500 capitalize">{task.task_type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ✓ Completado
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {(() => {
                                                try {
                                                    const date = new Date(task.created_at);
                                                    if (isNaN(date.getTime())) {
                                                        return 'Fecha no válida';
                                                    }
                                                    return date.toLocaleString('es-ES', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: '2-digit'
                                                    });
                                                } catch (error) {
                                                    console.error('Error parsing date:', task.created_at, error);
                                                    return 'Fecha no disponible';
                                                }
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <BarChart3 className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                            <h3 className="text-sm font-medium text-gray-900 mb-1">Sin actividad reciente</h3>
                            <p className="text-sm text-gray-500">Las consultas aparecerán aquí cuando uses RouterAI</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Información del Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Modelos Disponibles</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-gray-900">GPT-4 Turbo</span>
                            </div>
                            <span className="text-sm text-green-600 font-medium">Activo</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-gray-900">Claude 3.5 Sonnet</span>
                            </div>
                            <span className="text-sm text-green-600 font-medium">Activo</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-gray-900">Gemini Pro</span>
                            </div>
                            <span className="text-sm text-green-600 font-medium">Activo</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Servicio</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">API Gateway</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-600">Operativo</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Balanceador de Carga</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-600">Operativo</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tiempo de Respuesta</span>
                            <span className="text-sm font-medium text-gray-900">1.2s promedio</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Disponibilidad (24h)</span>
                            <span className="text-sm font-medium text-gray-900">99.9%</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Última actualización</span>
                            <span className="text-sm font-medium text-gray-900">Hace 2 min</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}