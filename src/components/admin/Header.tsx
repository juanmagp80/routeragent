"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, LogOut, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHeader() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const { user } = useAuth();

    // Función para obtener notificaciones
    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/v1/notifications');
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        fetchNotifications();
        // Actualizar cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = () => {
        router.push('/admin/notifications');
    };

    const handleLogout = () => {
        // Limpiar todas las sesiones y tokens
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();

            // También limpiar cookies de Supabase si existen
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        }

        // Redirigir al login
        router.push('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Search */}
                    <div className="flex items-center">
                        {searchOpen ? (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    placeholder="Buscar..."
                                    onBlur={() => setSearchOpen(false)}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                            >
                                <Search className="h-6 w-6" />
                                <span className="sr-only">Abrir búsqueda</span>
                            </button>
                        )}
                    </div>

                    {/* Right side - Notifications and user menu */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button
                            onClick={handleNotificationClick}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            title={unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Ver notificaciones'}
                        >
                            <span className="sr-only">Ver notificaciones</span>
                            <div className="relative">
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </button>

                        {/* User menu */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-emerald-600" />
                                </div>
                                <span className="ml-2 hidden md:block text-sm font-medium text-gray-700">{user?.name || 'Usuario'}</span>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                <span className="hidden sm:block">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}