"use client";

import { motion } from 'framer-motion';
import { BarChart3, DollarSign, LogOut, Network, User, Activity, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { clearPendingRedirect } from '../../utils/redirect';
import { getUserMetrics, getUserStats, UserMetrics, UserStats } from '../../services/userMetrics';

console.log('📁 UserDashboard module loaded');

export default function UserDashboard() {
    console.log('🏠 UserDashboard component instantiated');
    const { user, logout, loading: authLoading, isHydrated } = useAuth();
    const router = useRouter();
    
    // Estados para métricas reales
    const [metrics, setMetrics] = useState<UserMetrics | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

    console.log('🏠 UserDashboard render - isHydrated:', isHydrated, 'authLoading:', authLoading, 'user:', !!user);

    useEffect(() => {
        console.log('UserDashboard useEffect - user:', user);
        console.log('UserDashboard useEffect - authLoading:', authLoading);
        console.log('UserDashboard useEffect - isHydrated:', isHydrated);

        // Limpiar redirección pendiente cuando llegamos aquí
        clearPendingRedirect();

        // Solo verificar autenticación cuando esté completamente hidratado y no esté cargando
        if (isHydrated && !authLoading) {
            if (!user) {
                console.log('Usuario no autenticado, redirigiendo a login');
                router.push('/login');
            } else {
                console.log('✅ Usuario autenticado, dashboard listo para mostrar');
                // Cargar métricas reales cuando el usuario esté disponible
                loadUserMetrics(user.id);
            }
        }
    }, [user, authLoading, isHydrated, router]);

    // Función para cargar métricas del usuario
    const loadUserMetrics = async (userId: string) => {
        try {
            setIsLoadingMetrics(true);
            console.log('📊 Cargando métricas para usuario:', userId);
            
            const [userMetrics, userStats] = await Promise.all([
                getUserMetrics(userId),
                getUserStats(userId)
            ]);
            
            setMetrics(userMetrics);
            setStats(userStats);
            console.log('✅ Métricas cargadas:', { userMetrics, userStats });
        } catch (error) {
            console.error('💥 Error cargando métricas:', error);
            // En caso de error, usar valores por defecto
            setMetrics({
                requests: 0,
                cost: 0,
                limit: 1000,
                apiKeysCount: 0,
                recentActivity: []
            });
            setStats({
                totalRequests: 0,
                totalCost: 0,
                requestsThisMonth: 0,
                costThisMonth: 0,
                avgResponseTime: 0,
                mostUsedModel: 'N/A'
            });
        } finally {
            setIsLoadingMetrics(false);
        }
    };

    // Mostrar loader solo si no hay usuario y está cargando
    if ((!isHydrated || authLoading) && !user) {
        console.log('🔄 Mostrando loader - isHydrated:', isHydrated, 'authLoading:', authLoading);
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-white">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    // Si no hay usuario después de que todo esté cargado, mostrar redirección
    if (!user) {
        console.log('❌ No hay usuario, mostrando pantalla de redirección');
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white">Redirigiendo...</p>
                </div>
            </div>
        );
    }

    console.log('🎉 Renderizando dashboard completo para usuario:', user.email);

    const handleLogout = async () => {
        try {
            console.log('Cerrando sesión...');
            await logout();
        } catch (error) {
            console.error('Error en logout:', error);
        }
    };

    // Función para formatear fecha relativa
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Hace menos de un minuto';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    };

    // Función para formatear tipo de tarea
    const formatTaskType = (taskType: string) => {
        const taskTypes: Record<string, string> = {
            'summary': 'Resumen de documento',
            'translation': 'Traducción',
            'analysis': 'Análisis',
            'generation': 'Generación de texto',
            'classification': 'Clasificación',
            'extraction': 'Extracción de datos'
        };
        return taskTypes[taskType] || taskType;
    };

    // Datos del usuario usando métricas reales o valores por defecto
    const userData = {
        name: user.name || "Usuario",
        email: user.email || "",
        plan: user.plan || "free",
        usage: {
            requests: metrics?.requests || 0,
            limit: metrics?.limit || (user.api_key_limit ? user.api_key_limit * 1000 : 1000),
            cost: metrics?.cost || 0
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg rotate-12 absolute"></div>
                                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center relative">
                                    <Network className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="ml-2 text-xl font-bold">RouterAI</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <span className="ml-2 text-sm font-medium">{userData.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-sm text-slate-400 hover:text-white"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Panel de Usuario</h1>
                    <p className="text-slate-400 mt-2">Bienvenido de vuelta, {userData.name}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Plan Actual</p>
                                <p className="text-2xl font-bold text-emerald-400 capitalize">{userData.plan}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <Network className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Solicitudes</p>
                                {isLoadingMetrics ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-slate-600 rounded w-20 mb-2"></div>
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold">
                                        {userData.usage.requests.toLocaleString()} / {userData.usage.limit.toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        {!isLoadingMetrics && (
                            <div className="mt-4">
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((userData.usage.requests / userData.usage.limit) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Costo Total</p>
                                {isLoadingMetrics ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-slate-600 rounded w-16 mb-2"></div>
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-emerald-400">${userData.usage.cost.toFixed(2)}</p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">API Keys</p>
                                {isLoadingMetrics ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-slate-600 rounded w-12 mb-2"></div>
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-emerald-400">{metrics?.apiKeysCount || 0}</p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Additional Stats Row */}
                {stats && !isLoadingMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">Este Mes</p>
                                    <p className="text-xl font-bold">{stats.requestsThisMonth} requests</p>
                                    <p className="text-sm text-slate-400">${stats.costThisMonth.toFixed(2)}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-blue-400" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">Tiempo Promedio</p>
                                    <p className="text-xl font-bold">{stats.avgResponseTime}ms</p>
                                    <p className="text-sm text-slate-400">respuesta</p>
                                </div>
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">Modelo Favorito</p>
                                    <p className="text-xl font-bold">{stats.mostUsedModel}</p>
                                    <p className="text-sm text-slate-400">más usado</p>
                                </div>
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Network className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Actions Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8"
                >
                    <h2 className="text-xl font-bold mb-4">🚀 Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/user/api-test')}
                            className="flex items-center p-4 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 transition-all duration-200"
                        >
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
                                <Network className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-emerald-400">Probar API</p>
                                <p className="text-sm text-slate-400">Test del router de modelos</p>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/user/api-keys')}
                            className="flex items-center p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-all duration-200"
                        >
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-blue-400">API Keys</p>
                                <p className="text-sm text-slate-400">Gestionar claves de API</p>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/user/metrics')}
                            className="flex items-center p-4 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/30 transition-all duration-200"
                        >
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-purple-400">Métricas</p>
                                <p className="text-sm text-slate-400">Análisis detallado</p>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                >
                    <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
                    {isLoadingMetrics ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="animate-pulse">
                                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="h-5 bg-slate-600 rounded w-1/3 mb-2"></div>
                                            <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="h-5 bg-slate-600 rounded w-16 mb-2"></div>
                                            <div className="h-4 bg-slate-600 rounded w-12"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {metrics.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{formatTaskType(activity.task_type)}</p>
                                        <p className="text-sm text-slate-400">{formatRelativeTime(activity.created_at)}</p>
                                        {activity.tokens_used && (
                                            <p className="text-xs text-slate-500">{activity.tokens_used} tokens</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-emerald-400">${activity.cost.toFixed(3)}</p>
                                        <p className="text-sm text-slate-400 capitalize">{activity.model_used}</p>
                                        <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                                            activity.status === 'completed' 
                                                ? 'bg-emerald-500/20 text-emerald-400' 
                                                : activity.status === 'pending' 
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {activity.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No hay actividad reciente</p>
                            <p className="text-sm text-slate-500 mt-2">
                                Las solicitudes aparecerán aquí cuando comiences a usar la API
                            </p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}