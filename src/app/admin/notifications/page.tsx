"use client";

import { useAuth } from "@/hooks/useAuth";
import {
    AlertCircle,
    BarChart3,
    Bell,
    Check,
    Clock,
    Mail,
    MessageSquare,
    Save,
    Settings,
    Smartphone
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    const { user, loading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

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
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No hay notificaciones disponibles</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${notification.is_read
                                            ? 'bg-gray-50 border-gray-200'
                                            : 'bg-emerald-50 border-emerald-200 shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${notification.is_read
                                                ? 'bg-gray-200'
                                                : 'bg-emerald-100'
                                            }`}>
                                            <Bell className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
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
                                        <p className="text-sm text-gray-500">Notificaciones push</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notificationPreferences.push}
                                        onChange={(e) => setNotificationPreferences(prev => ({
                                            ...prev,
                                            push: e.target.checked
                                        }))}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
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
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="h-5 w-5 text-gray-600" />
                                    <h3 className="font-medium text-gray-900">Horas Silenciosas</h3>
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
                        onClick={() => {
                            setSaving(true);
                            setMessage('Configuración guardada exitosamente');
                            setTimeout(() => {
                                setSaving(false);
                                setMessage('');
                            }, 2000);
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
