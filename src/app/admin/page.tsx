"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getQuickMetrics, QuickMetrics } from "@/services/quickMetrics";
import { getUserMetrics, getUserStats, UserMetrics, UserStats } from "@/services/userMetrics";
import { BarChart3, Cpu, Key, Sparkles, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../config/database";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [metrics, setMetrics] = useState<UserMetrics | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [quickMetrics, setQuickMetrics] = useState<QuickMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        if (!authLoading && user) {
            checkUserAndLoadMetrics();
        }
    }, [user, authLoading]);

    // Cargar métricas rápidas por separado
    useEffect(() => {
        if (!authLoading && user) {
            loadQuickMetrics();
        }
    }, [user, authLoading]);

    const loadQuickMetrics = async () => {
        if (!user) return;

        try {
            console.log('⚡ [QUICK] Cargando métricas rápidas...');
            const quickData = await getQuickMetrics(user.id);
            setQuickMetrics(quickData);
            console.log('✅ [QUICK] Métricas rápidas cargadas:', quickData);
        } catch (error) {
            console.warn('⚠️ [QUICK] Error en métricas rápidas:', error);
        }
    };

    const checkUserAndLoadMetrics = async () => {
        try {
            console.log('📊 Checking user status...');
            setLoading(true);

            if (!user) {
                console.error('No authenticated user found');
                return;
            }

            // Buscar información del usuario en nuestra base de datos usando cliente autenticado
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            console.log('🔍 User query result:', { userData, userError });

            if (userError) {
                console.error('Error fetching user data:', userError);
                console.log('⚠️ Usando endpoint admin como fallback...');

                // Si falla la consulta directa, usar endpoint admin
                try {
                    const adminResponse = await fetch(`/api/admin-metrics?userId=${user.id}`);
                    const adminData = await adminResponse.json();

                    if (adminData.success) {
                        console.log('✅ Datos cargados via admin endpoint');
                        setMetrics(adminData.metrics);
                        setStats(adminData.stats);
                        setIsNewUser(false);
                        return;
                    }
                } catch (adminError) {
                    console.error('❌ Admin endpoint también falló:', adminError);
                }
                return;
            }

            setUserInfo(userData);

            // Verificar si el usuario tiene API keys (para determinar si es nuevo)
            console.log('🔍 Buscando API keys para usuario ID:', user.id);
            const { data: apiKeys, error: keysError } = await supabase
                .from('api_keys')
                .select('id, name, is_active')
                .eq('user_id', user.id);

            console.log('🔑 API keys encontradas:', apiKeys, 'Error:', keysError);

            if (keysError) {
                console.error('Error checking API keys:', keysError);
            }

            // Si no tiene API keys o fue creado recientemente, es un usuario nuevo
            const isRecentUser = userData.created_at &&
                new Date(userData.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
            const hasNoApiKeys = !apiKeys || apiKeys.length === 0;

            console.log('🕐 Usuario reciente?', isRecentUser, 'Creado:', userData.created_at);
            console.log('🔑 No tiene API keys?', hasNoApiKeys, 'Count:', apiKeys?.length);
            console.log('🎯 Es usuario nuevo?', isRecentUser && hasNoApiKeys);

            if (isRecentUser && hasNoApiKeys) {
                console.log('🎉 New user detected!');
                setIsNewUser(true);
            } else {
                console.log('📊 Loading real metrics for existing user...');

                // Intentar cargar métricas con cliente autenticado primero
                try {
                    console.log('🔍 Intentando carga directa con cliente autenticado...');

                    // Consultas directas con cliente autenticado
                    const [apiKeysResult, activityResult, logsResult, totalRequestsResult] = await Promise.all([
                        supabase
                            .from('api_keys')
                            .select('id', { count: 'exact', head: true })
                            .eq('user_id', user.id)
                            .eq('is_active', true),

                        supabase
                            .from('usage_logs')
                            .select('id, task_type, model_used, cost, created_at, status, tokens_used')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false })
                            .limit(10),

                        supabase
                            .from('usage_logs')
                            .select('cost, latency_ms')
                            .eq('user_id', user.id),

                        supabase
                            .from('usage_logs')
                            .select('id', { count: 'exact', head: true })
                            .eq('user_id', user.id)
                    ]);

                    console.log('📊 Resultados consultas directas:', {
                        apiKeys: { count: apiKeysResult.count, error: apiKeysResult.error },
                        activity: { count: activityResult.data?.length, error: activityResult.error },
                        logs: { count: logsResult.data?.length, error: logsResult.error },
                        totalRequests: { count: totalRequestsResult.count, error: totalRequestsResult.error }
                    });

                    if (!apiKeysResult.error && !activityResult.error && !logsResult.error && !totalRequestsResult.error) {
                        // Procesar datos exitosos
                        const totalCost = logsResult.data?.reduce((sum, log) => sum + parseFloat(log.cost || '0'), 0) || 0;
                        const avgLatency = logsResult.data && logsResult.data.length > 0
                            ? Math.round(logsResult.data.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / logsResult.data.length)
                            : 0;

                        // Calcular modelos únicos
                        const uniqueModels = new Set(activityResult.data?.map(activity => activity.model_used).filter(Boolean) || []);

                        console.log('🔍 totalRequestsResult.count:', totalRequestsResult.count);

                        const directMetrics = {
                            requests: totalRequestsResult.count || 0,
                            cost: parseFloat(totalCost.toFixed(4)),
                            limit: userData?.api_key_limit ? userData.api_key_limit * 1000 : 1000,
                            apiKeysCount: apiKeysResult.count || 0,
                            uniqueModels: uniqueModels.size,
                            recentActivity: activityResult.data?.map(activity => ({
                                id: activity.id,
                                task_type: activity.task_type || 'unknown',
                                model_used: activity.model_used || 'unknown',
                                cost: parseFloat(activity.cost || '0'),
                                created_at: activity.created_at,
                                status: activity.status || 'completed',
                                tokens_used: activity.tokens_used
                            })) || []
                        };

                        const directStats = {
                            totalRequests: totalRequestsResult.count || 0,
                            totalCost: totalCost,
                            requestsThisMonth: totalRequestsResult.count || 0,
                            costThisMonth: totalCost,
                            avgResponseTime: avgLatency,
                            mostUsedModel: 'GPT-4o Mini'
                        };

                        console.log('✅ Métricas cargadas directamente:', directMetrics);
                        setMetrics(directMetrics);
                        setStats(directStats);

                    } else {
                        throw new Error('Consultas directas fallaron, usando fallback admin');
                    }

                } catch (directError) {
                    console.log('⚠️ Consultas directas fallaron, usando endpoint working...', directError);

                    // Usar el endpoint que sabemos que funciona
                    try {
                        const activityResponse = await fetch(`/api/simple-activity?userId=${user.id}`);
                        const activityData = await activityResponse.json();

                        if (activityData.success && activityData.activity) {
                            console.log('✅ Actividad cargada con endpoint working:', activityData.count, 'registros');

                            // Obtener el número real de API keys activas del usuario
                            const { count: realApiKeysCount } = await supabase
                                .from('api_keys')
                                .select('id', { count: 'exact', head: true })
                                .eq('user_id', user.id)
                                .eq('is_active', true);

                            // Calcular modelos únicos del endpoint de respaldo
                            const uniqueModelsBackup = new Set(activityData.activity.map((activity: any) => activity.model_used).filter(Boolean));

                            // Crear métricas básicas con la actividad que funciona
                            const workingMetrics = {
                                requests: activityData.count,
                                cost: activityData.activity.reduce((sum: number, activity: any) => sum + activity.cost, 0),
                                limit: userData?.api_key_limit ? userData.api_key_limit * 1000 : 1000,
                                apiKeysCount: realApiKeysCount || 0,
                                uniqueModels: uniqueModelsBackup.size,
                                recentActivity: activityData.activity
                            };

                            const workingStats = {
                                totalRequests: activityData.count,
                                totalCost: workingMetrics.cost,
                                requestsThisMonth: activityData.count,
                                costThisMonth: workingMetrics.cost,
                                avgResponseTime: Math.round(activityData.activity.reduce((sum: number, activity: any) => sum + (activity.latency_ms || 0), 0) / activityData.count),
                                mostUsedModel: 'GPT-4o Mini'
                            };

                            console.log('✅ Métricas creadas con endpoint working:', workingMetrics);
                            setMetrics(workingMetrics);
                            setStats(workingStats);
                        } else {
                            throw new Error('Endpoint working también falló');
                        }
                    } catch (workingError) {
                        console.log('❌ Endpoint working también falló, usando fallback getUserMetrics...', workingError);

                        // Último recurso
                        const [userMetrics, userStats] = await Promise.all([
                            getUserMetrics(user.id),
                            getUserStats(user.id)
                        ]);
                        console.log('✅ Métricas cargadas con último recurso:', { userMetrics, userStats });
                        setMetrics(userMetrics);
                        setStats(userStats);
                    }
                }
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
                            <p className="text-2xl font-semibold text-gray-900" id="usage-display">
                                {quickMetrics ? `${quickMetrics.requests} / 1,000` : '0 / 1,000'}
                            </p>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full"
                                    style={{ width: quickMetrics ? `${Math.min((quickMetrics.requests / 1000) * 100, 100)}%` : '0%' }}
                                ></div>
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
                            <p className="text-2xl font-semibold text-gray-900">{metrics?.requests?.toLocaleString() || '0'}</p>
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
                            <p className="text-2xl font-semibold text-gray-900">{metrics?.apiKeysCount || '0'}</p>
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
                            <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats?.avgResponseTime && stats.avgResponseTime > 0
                                    ? `${stats.avgResponseTime}ms`
                                    : '0ms'}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                            <TrendingUp className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">Respuesta de API</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Modelos Usados</p>
                            <p className="text-2xl font-semibold text-gray-900">{metrics?.uniqueModels || '0'}</p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                            <Cpu className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">Modelos diferentes</p>
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
                    {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {metrics.recentActivity.map((activity, index) => (
                                <div key={activity.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{activity.model_used}</p>
                                            <p className="text-sm text-gray-500 capitalize">{activity.task_type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : activity.status === 'failed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {activity.status === 'completed' ? '✓ Completado' :
                                                    activity.status === 'failed' ? '✗ Error' : '⏳ Procesando'}
                                            </span>

                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {(() => {
                                                try {
                                                    const date = new Date(activity.created_at);
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
                                                    console.error('Error parsing date:', activity.created_at, error);
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