"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/v1/notifications');

            if (!response.ok) {
                throw new Error('Error al cargar notificaciones');
            }

            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para marcar como leída y navegar
    const handleNotificationClick = async (notification: Notification) => {
        // Marcar como leída si no lo está
        if (!notification.is_read) {
            try {
                const response = await fetch(`/api/v1/notifications/${notification.id}/read`, {
                    method: 'PUT'
                });

                if (response.ok) {
                    setNotifications(prev =>
                        prev.map(notif =>
                            notif.id === notification.id
                                ? { ...notif, is_read: true }
                                : notif
                        )
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error('Error marking notification as read:', err);
            }
        }

        // Navegar según el tipo de notificación
        const actionUrl = notification.data?.action_url;

        switch (notification.type) {
            case 'api_key_created':
                router.push(actionUrl || '/admin/keys');
                break;
            case 'usage_limit_warning':
            case 'usage_alert':
                router.push(actionUrl || '/admin/analytics');
                break;
            case 'payment_failed':
            case 'payment_success':
                router.push(actionUrl || '/admin/billing');
                break;
            case 'security_alert':
                router.push(actionUrl || '/admin/settings');
                break;
            case 'system_maintenance':
                router.push(actionUrl || '/admin/notifications');
                break;
            case 'welcome':
                router.push('/admin');
                break;
            default:
                // Para tipos desconocidos, usar action_url si existe
                if (actionUrl) {
                    router.push(actionUrl);
                }
                break;
        }
    };

    // Marcar todas como leídas
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/v1/notifications/read-all', {
                method: 'PUT'
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, is_read: true }))
                );
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Obtener estilo según el tipo de notificación
    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'api_key_created':
                return {
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-l-blue-500',
                    icon: '🔑',
                    actionText: 'Ver API Keys'
                };
            case 'usage_limit_warning':
            case 'usage_alert':
                return {
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-l-yellow-500',
                    icon: '⚠️',
                    actionText: 'Ver Analytics'
                };
            case 'payment_failed':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-l-red-500',
                    icon: '💳',
                    actionText: 'Solucionar Pago'
                };
            case 'payment_success':
                return {
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-l-emerald-500',
                    icon: '✅',
                    actionText: 'Ver Facturación'
                };
            case 'security_alert':
                return {
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-l-orange-500',
                    icon: '🔒',
                    actionText: 'Revisar Seguridad'
                };
            case 'system_maintenance':
                return {
                    bgColor: 'bg-indigo-50',
                    borderColor: 'border-l-indigo-500',
                    icon: '🔧',
                    actionText: 'Ver Detalles'
                };
            case 'welcome':
                return {
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-l-purple-500',
                    icon: '🎉',
                    actionText: 'Ir al Dashboard'
                };
            default:
                return {
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-l-gray-500',
                    icon: '📢',
                    actionText: 'Ver Detalles'
                };
        }
    };

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else {
            return 'hace unos minutos';
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refrescar notificaciones cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Notificaciones
                        {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {unreadCount} sin leer
                            </span>
                        )}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Mantente al día con eventos importantes de tu cuenta
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <div className="text-red-600 mb-2">❌ Error</div>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={fetchNotifications}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="text-gray-400 text-6xl mb-4">🔔</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No tienes notificaciones
                        </h3>
                        <p className="text-gray-600">
                            Las notificaciones aparecerán aquí cuando ocurran eventos importantes en tu cuenta.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => {
                            const style = getNotificationStyle(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-6 ${style.bgColor} ${style.borderColor} border-l-4 ${!notification.is_read ? 'opacity-100' : 'opacity-75'
                                        } cursor-pointer hover:bg-opacity-80 hover:shadow-md transition-all group relative`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start flex-1">
                                            <div className="text-2xl mr-3">{style.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                        {!notification.is_read && (
                                                            <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                                        )}
                                                    </h3>
                                                    <time className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                        {formatDate(notification.created_at)}
                                                    </time>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {notification.message}
                                                </p>
                                                {notification.data && Object.keys(notification.data).length > 0 && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        {notification.type === 'api_key_created' && notification.data.api_key_name && (
                                                            <span>API Key: {notification.data.api_key_name}</span>
                                                        )}
                                                        {notification.type === 'usage_limit_warning' && notification.data.usage_percentage && (
                                                            <span>Uso: {notification.data.usage_percentage}% ({notification.data.current_usage}/{notification.data.limit} requests)</span>
                                                        )}
                                                        {notification.type === 'payment_failed' && notification.data.amount && (
                                                            <span>Monto: {notification.data.amount} • Próximo intento: {notification.data.next_retry}</span>
                                                        )}
                                                        {notification.type === 'security_alert' && notification.data.location && (
                                                            <span>Ubicación: {notification.data.location} • IP: {notification.data.ip}</span>
                                                        )}
                                                        {notification.type === 'system_maintenance' && notification.data.start_time && (
                                                            <span>Desde: {new Date(notification.data.start_time).toLocaleString()}</span>
                                                        )}
                                                        {notification.type === 'usage_alert' && notification.data.percentage && (
                                                            <span>Uso: {notification.data.percentage}%</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center text-xs text-blue-600 font-medium">
                                                {style.actionText}
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Botón para refrescar */}
            <div className="mt-4 text-center">
                <button
                    onClick={fetchNotifications}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                >
                    {loading ? 'Cargando...' : '🔄 Actualizar notificaciones'}
                </button>
            </div>
        </div>
    );
}
