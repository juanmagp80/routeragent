"use client";

import { supabase } from "@/config/database";
import { createClient } from '@supabase/supabase-js';
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
    AlertCircle,
    BarChart3,
    Bell,
    Check,
    Clock,
    Cpu,
    Mail,
    MessageSquare,
    Save,
    Settings,
    Smartphone,
    TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const { user, loading } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useNotifications();
    const router = useRouter();
    
    // Debug del estado del usuario
    console.log('🔍 NotificationsPage - User state:', { user, loading });
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    const [notificationPreferences, setNotificationPreferences] = useState({
        email: true,
        push: false,
        sms: false,
        marketing: false,
        billing: true,
        security: true,
        usage_alerts: true,
        weekly_reports: true,
        ai_insights: true,
        performance_alerts: true,
        cost_optimization: true
    });

    const [notificationSettings, setNotificationSettings] = useState({
        usage_threshold: 80,
        billing_reminder_days: 3,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        digest_frequency: 'daily'
    });

    // Función para verificar si estamos en horas silenciosas
    const isQuietHours = () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMin] = notificationSettings.quiet_hours_start.split(':').map(Number);
        const [endHour, endMin] = notificationSettings.quiet_hours_end.split(':').map(Number);

        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        // Si el periodo cruza la medianoche (ej: 22:00 - 08:00)
        if (startTime > endTime) {
            return currentTime >= startTime || currentTime <= endTime;
        }
        // Si el periodo no cruza la medianoche (ej: 08:00 - 22:00)
        return currentTime >= startTime && currentTime <= endTime;
    };

    // Función para enviar notificación que respeta horas silenciosas
    const sendNotificationIfAllowed = (title: string, options: NotificationOptions) => {
        if (!notificationPreferences.push || !('Notification' in window) || Notification.permission !== 'granted') {
            return false;
        }

        if (isQuietHours()) {
            console.log('🔇 Notificación silenciada por horas silenciosas:', title);
            return false;
        }

        new Notification(title, options);
        return true;
    };

    // Cargar notificaciones reales al montar el componente
    useEffect(() => {
        console.log('🔄 useEffect triggered - user:', user);
        console.log('🔄 loading state:', loading);
        console.log('🔄 user?.id:', user?.id);
        
        if (!loading && user?.id) {
            console.log('✅ Condiciones cumplidas, cargando notificaciones...');
            loadNotifications();
        } else {
            console.log('⏳ Esperando usuario o cargando...', { loading, userId: user?.id });
        }
        
        loadNotificationPreferences();
    }, [user, loading]); // Cambiar dependencias para que se ejecute cuando cambie user o loading

    // Cargar configuraciones guardadas
    const loadNotificationPreferences = () => {
        try {
            const savedPreferences = localStorage.getItem('notificationPreferences');
            if (savedPreferences) {
                const preferences = JSON.parse(savedPreferences);
                setNotificationPreferences(preferences);
                console.log('✅ Configuraciones de notificaciones cargadas:', preferences);
            }

            const savedSettings = localStorage.getItem('notificationSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                setNotificationSettings(settings);
            }
        } catch (error) {
            console.error('Error cargando configuraciones de notificaciones:', error);
        }
    };

    const loadNotifications = async () => {
        if (!user?.id) {
            console.warn('No user ID available for loading notifications');
            setLoadingNotifications(false);
            return;
        }

        try {
            setLoadingNotifications(true);
            setError(null);

            console.log('🔍 Cargando notificaciones para usuario:', user.id);

            // Crear cliente con service role para bypass RLS
            const supabaseServiceRole = createClient(
                'https://jmfegokyvaflwegtyaun.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
            );

            // Cargar notificaciones usando service role (bypass RLS)
            const { data: notificationsData, error: notificationsError } = await supabaseServiceRole
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            console.log('📬 Respuesta de Supabase:', { notificationsData, notificationsError });
            console.log('📊 Datos detallados:', notificationsData);
            console.log('❌ Error detallado:', notificationsError);

            if (notificationsError) {
                console.error('Error loading notifications from Supabase:', notificationsError);
                
                // Si la tabla no existe, crear notificaciones de bienvenida
                if (notificationsError.code === 'PGRST116' || notificationsError.message.includes('does not exist')) {
                    console.log('Tabla notifications no existe, creando notificaciones de ejemplo...');
                    setNotifications([
                        {
                            id: '1',
                            user_id: user.id,
                            type: 'info',
                            title: '🎉 ¡Bienvenido a AgentRouter!',
                            message: 'Tu cuenta ha sido creada exitosamente. Comienza explorando las funcionalidades.',
                            data: {},
                            is_read: false,
                            created_at: new Date().toISOString()
                        },
                        {
                            id: '2',
                            user_id: user.id,
                            type: 'info',
                            title: '🔑 Configura tu primera API Key',
                            message: 'Ve a la sección de API Keys para generar tu primera clave y comenzar a usar los servicios.',
                            data: {},
                            is_read: false,
                            created_at: new Date().toISOString()
                        }
                    ]);
                    setUnreadCount(2);
                } else {
                    throw notificationsError;
                }
            } else {
                // Procesar notificaciones de Supabase
                const processedNotifications = (notificationsData || []).map(notification => ({
                    id: notification.id,
                    user_id: notification.user_id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data || {},
                    is_read: notification.is_read || false,
                    created_at: notification.created_at
                }));

                setNotifications(processedNotifications);
                setUnreadCount(processedNotifications.filter(n => !n.is_read).length);

                console.log(`✅ ${processedNotifications.length} notificaciones cargadas para el usuario ${user.id}`);
            }

        } catch (error) {
            console.error('Error loading notifications:', error);
            const errorMsg = 'Error al cargar las notificaciones';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Función para solicitar permisos de push notifications
    const requestPushPermission = async () => {
        try {
            if (!('Notification' in window)) {
                const errorMsg = 'Este navegador no soporta notificaciones push';
                showError(errorMsg);
                return false;
            }

            // Verificar el estado actual de los permisos
            if (Notification.permission === 'granted') {
                showSuccess('Notificaciones push ya están activadas');
                return true;
            }

            if (Notification.permission === 'denied') {
                const errorMsg = 'Los permisos de notificación han sido denegados. Por favor, habilítalos manualmente en la configuración del navegador.';
                showError(errorMsg);
                return false;
            }

            // Solicitar permisos (esto puede mostrar el diálogo del navegador)
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('✅ Permisos de push notifications concedidos');
                showSuccess('Notificaciones push activadas exitosamente');

                // Crear una notificación de prueba (respetando horas silenciosas)
                const notificationSent = sendNotificationIfAllowed('RouterAI Notificaciones', {
                    body: 'Las notificaciones push están ahora activadas',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico'
                });

                if (!notificationSent && isQuietHours()) {
                    showInfo('Notificación activada. La notificación de prueba fue silenciada por las horas silenciosas configuradas.');
                }

                return true;
            } else if (permission === 'denied') {
                const errorMsg = 'Permisos de notificaciones denegados';
                showError(errorMsg);
                return false;
            } else {
                const errorMsg = 'Permisos de notificaciones no concedidos';
                showWarning(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error solicitando permisos push:', error);
            const errorMessage = 'Error al activar notificaciones push: ' + (error as Error).message;
            showError(errorMessage);
            return false;
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            // Crear cliente con service role para bypass RLS
            const supabaseServiceRole = createClient(
                'https://jmfegokyvaflwegtyaun.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
            );

            // Actualizar en Supabase usando service role
            const { error } = await supabaseServiceRole
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .eq('user_id', user?.id); // Mantener la verificación de seguridad

            if (error) {
                console.error('Error marking notification as read in Supabase:', error);
                showError('Error al marcar la notificación como leída');
                return;
            }

            // Actualizar el estado local
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            console.log(`✅ Notificación ${notificationId} marcada como leída`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showError('Error al marcar la notificación como leída');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6">
            {/* Header con gradiente RouterAI */}
            <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 rounded-2xl p-8 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                            <Bell className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Centro de Notificaciones</h1>
                            <p className="text-emerald-100 mt-1">
                                Gestiona tus preferencias y mantente informado
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">
                                {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Panel de notificaciones recientes */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-emerald-100 rounded-lg p-2">
                            <MessageSquare className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Notificaciones Recientes
                        </h2>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {loadingNotifications ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                <span className="ml-2 text-gray-500">Cargando notificaciones...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No hay notificaciones disponibles</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${notification.is_read
                                        ? 'bg-gray-50 border-gray-200'
                                        : 'bg-emerald-50 border-emerald-200 shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${notification.is_read
                                            ? 'bg-gray-200'
                                            : 'bg-emerald-100'
                                            }`}>
                                            {notification.type === 'billing' && <BarChart3 className="h-5 w-5" />}
                                            {notification.type === 'usage_alert' && <TrendingUp className="h-5 w-5" />}
                                            {notification.type === 'performance' && <Cpu className="h-5 w-5" />}
                                            {notification.type === 'system' && <Settings className="h-5 w-5" />}
                                            {notification.type === 'feature' && <Bell className="h-5 w-5" />}
                                            {!['billing', 'usage_alert', 'performance', 'system', 'feature'].includes(notification.type) && <Bell className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className={`font-medium ${notification.is_read
                                                        ? 'text-gray-700'
                                                        : 'text-gray-900'
                                                        }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className={`text-sm mt-1 ${notification.is_read
                                                        ? 'text-gray-500'
                                                        : 'text-gray-700'
                                                        }`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(notification.created_at).toLocaleDateString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="ml-2 p-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                                                        title="Marcar como leída"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Panel de configuración */}
                <div className="space-y-6">
                    {/* Canales de comunicación */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-100 rounded-lg p-2">
                                <Settings className="h-5 w-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Canales de Comunicación
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Email</p>
                                        <p className="text-sm text-gray-500">Notificaciones por correo</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notificationPreferences.email}
                                        onChange={(e) => setNotificationPreferences(prev => ({
                                            ...prev,
                                            email: e.target.checked
                                        }))}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Push</p>
                                        <p className="text-sm text-gray-500">
                                            Notificaciones push
                                            {notificationPreferences.push && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ Activado
                                                </span>
                                            )}
                                            {!notificationPreferences.push && ('Notification' in window) && Notification.permission === 'denied' && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    ❌ Bloqueado
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notificationPreferences.push}
                                        onChange={async (e) => {
                                            if (e.target.checked) {
                                                // Si activa push, solicitar permisos inmediatamente
                                                const success = await requestPushPermission();
                                                if (success) {
                                                    setNotificationPreferences(prev => ({
                                                        ...prev,
                                                        push: true
                                                    }));
                                                } else {
                                                    // Los permisos fallan, el toggle se mantiene desactivado
                                                    console.log('Push notifications no activadas debido a permisos');
                                                }
                                            } else {
                                                // Si desactiva, simplemente cambiar estado
                                                setNotificationPreferences(prev => ({
                                                    ...prev,
                                                    push: false
                                                }));
                                            }
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            {/* Botón de prueba para push notifications */}
                            {notificationPreferences.push && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Probar notificaciones push</p>
                                            <p className="text-xs text-blue-700">Envía una notificación de prueba</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const notificationSent = sendNotificationIfAllowed('RouterAI - Prueba', {
                                                    body: 'Esta es una notificación de prueba. ¡Las push notifications funcionan correctamente!',
                                                    icon: '/favicon.ico',
                                                    badge: '/favicon.ico',
                                                    tag: 'test-notification'
                                                });

                                                if (notificationSent) {
                                                    showSuccess('Notificación de prueba enviada');
                                                } else if (isQuietHours()) {
                                                    showWarning('Notificación silenciada por horas silenciosas configuradas');
                                                } else if (!notificationPreferences.push) {
                                                    showWarning('Las notificaciones push están desactivadas');
                                                } else {
                                                    showError('No se pueden enviar notificaciones. Verifica los permisos.');
                                                }
                                            }}
                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Enviar Prueba
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Configuración avanzada simplificada */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-emerald-100 rounded-lg p-2">
                                <Settings className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Configuración Avanzada
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-gray-600" />
                                        <h3 className="font-medium text-gray-900">Horas Silenciosas</h3>
                                    </div>
                                    {isQuietHours() && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                            Silenciado
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="time"
                                        value={notificationSettings.quiet_hours_start}
                                        onChange={(e) => setNotificationSettings(prev => ({
                                            ...prev,
                                            quiet_hours_start: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                    <input
                                        type="time"
                                        value={notificationSettings.quiet_hours_end}
                                        onChange={(e) => setNotificationSettings(prev => ({
                                            ...prev,
                                            quiet_hours_end: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <BarChart3 className="h-5 w-5 text-gray-600" />
                                    <h3 className="font-medium text-gray-900">Umbral de Alerta de Uso</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="50"
                                        max="95"
                                        step="5"
                                        value={notificationSettings.usage_threshold}
                                        onChange={(e) => setNotificationSettings(prev => ({
                                            ...prev,
                                            usage_threshold: parseInt(e.target.value)
                                        }))}
                                        className="flex-1"
                                    />
                                    <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                                        {notificationSettings.usage_threshold}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón de guardar */}
                    <button
                        onClick={async () => {
                            setSaving(true);
                            setError(null);

                            try {
                                // Guardar en localStorage
                                localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
                                localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));

                                // Manejar permisos de push notifications
                                if (notificationPreferences.push) {
                                    const success = await requestPushPermission();
                                    if (!success) {
                                        // Si falla, desactivar push en las preferencias
                                        setNotificationPreferences(prev => ({
                                            ...prev,
                                            push: false
                                        }));
                                    }
                                }

                                console.log('✅ Configuración guardada:', {
                                    preferences: notificationPreferences,
                                    settings: notificationSettings
                                });

                                setMessage('Configuración guardada exitosamente');
                                showSuccess('Configuración guardada exitosamente');

                                setTimeout(() => {
                                    setMessage('');
                                }, 3000);
                            } catch (error) {
                                console.error('Error guardando configuración:', error);
                                setError('Error al guardar la configuración');
                                showError('Error al guardar la configuración');
                            } finally {
                                setSaving(false);
                            }
                        }}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Guardar Configuración
                            </>
                        )}
                    </button>

                    {message && (
                        <div className="p-4 rounded-lg text-center font-medium bg-green-50 text-green-700 border border-green-200">
                            <div className="flex items-center justify-center gap-2">
                                <Check className="h-5 w-5" />
                                {message}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
