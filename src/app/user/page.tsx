"use client";

import { motion } from 'framer-motion';
import { BarChart3, DollarSign, LogOut, Network, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { clearPendingRedirect } from '../../utils/redirect';

console.log('📁 UserDashboard module loaded');

export default function UserDashboard() {
    console.log('🏠 UserDashboard component instantiated');
    const { user, logout, loading: authLoading, isHydrated } = useAuth();
    const router = useRouter();

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
            }
        }
    }, [user, authLoading, isHydrated, router]);

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

    // Datos del usuario del estado
    const userData = {
        name: user.name || "Usuario",
        email: user.email || "",
        plan: user.plan || "free",
        usage: {
            requests: 2450,
            limit: user.api_key_limit * 1000 || 5000,
            cost: 158.75
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
                                <span className="ml-2 text-xl font-bold">AgentRouter</span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Plan Actual</p>
                                <p className="text-2xl font-bold text-emerald-400">{userData.plan}</p>
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
                                <p className="text-2xl font-bold">
                                    {userData.usage.requests} / {userData.usage.limit}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-emerald-50 h-2 rounded-full"
                                    style={{ width: `${(userData.usage.requests / userData.usage.limit) * 100}%` }}
                                ></div>
                            </div>
                        </div>
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
                                <p className="text-2xl font-bold text-emerald-400">${userData.usage.cost}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-emerald-40" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                >
                    <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                <div>
                                    <p className="font-medium">Resumen de documento</p>
                                    <p className="text-sm text-slate-400">Hace 2 minutos</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-emerald-400">$0.023</p>
                                    <p className="text-sm text-slate-400">Claude-3</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}