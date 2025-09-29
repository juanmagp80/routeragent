"use client";

import { BACKEND_URL } from "@/config/backend";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Save, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        company: "",
        timezone: "Europe/Madrid"
    });

    const [notifications, setNotifications] = useState({
        email: true
    });

    // Cargar datos reales del usuario
    useEffect(() => {
        console.log('⚙️ Settings: User data from hook:', user);
        console.log('⚙️ Settings: Loading state:', loading);

        if (user && !loading) {
            console.log('✅ Settings: Loading user data into form');

            // Limpiar " - Test" del nombre si existe
            const cleanName = user.name?.replace(/ - Test$/i, '') || "";

            setProfile({
                name: cleanName,
                email: user.email || "",
                company: (user as any)?.company || "",
                timezone: "Europe/Madrid" // Predeterminado para España
            });

            // Cargar preferencias de notificaciones reales
            setNotifications({
                email: (user as any)?.email_notifications !== false
            });
        }
    }, [user, loading]);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            console.log('💾 Saving user settings:', profile);

            const response = await fetch(`${BACKEND_URL}/v1/user-dev`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    company: profile.company
                })
            });

            console.log('📡 Update response status:', response.status);
            const data = await response.json();
            console.log('📝 Update response data:', data);

            if (response.ok && data.success) {
                setMessage('✅ Configuración guardada exitosamente');

                // Recargar datos del usuario desde el hook
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                // Si el endpoint de actualización no está disponible, mostrar mensaje informativo
                if (response.status === 404) {
                    setMessage('ℹ️ Función de actualización no disponible en producción. Los datos se muestran correctamente desde la base de datos.');
                } else {
                    setMessage('❌ Error al guardar la configuración: ' + (data.error || 'Error desconocido'));
                }
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('❌ Error de conexión al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationChange = async (type: 'email', value: boolean) => {
        console.log(`🔔 Updating ${type} notification to:`, value);

        // Actualizar estado local inmediatamente para feedback visual
        setNotifications(prev => ({ ...prev, [type]: value }));

        try {
            const response = await fetch(`${BACKEND_URL}/v1/user-notifications-dev`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email_notifications: value
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('✅ Notification preference updated successfully');
                // Actualizar con los valores del servidor
                setNotifications({
                    email: data.notifications.email
                });
            } else {
                console.error('❌ Failed to update notification preference:', data.error);
                // Revertir el cambio local si falló
                setNotifications(prev => ({ ...prev, [type]: !value }));
                setMessage('❌ Error al actualizar preferencias de notificación');
            }
        } catch (error) {
            console.error('Error updating notification preference:', error);
            // Revertir el cambio local si falló
            setNotifications(prev => ({ ...prev, [type]: !value }));
            setMessage('❌ Error de conexión al actualizar notificaciones');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Administra la configuración de tu cuenta y preferencias
                </p>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-blue-800">⏳ Cargando datos del usuario...</p>
                </div>
            )}


            {/* Mensaje de estado */}
            {message && (
                <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    {message}
                </div>
            )}

            {/* Profile settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Perfil</h2>
                    </div>
                </div>
                <div className="px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Tu nombre completo"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Dirección de Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="tu@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                Empresa
                            </label>
                            <input
                                type="text"
                                id="company"
                                value={profile.company}
                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Nombre de tu empresa (opcional)"
                            />
                        </div>
                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                Zona Horaria
                            </label>
                            <select
                                id="timezone"
                                value={profile.timezone}
                                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            >
                                <option value="Europe/Madrid">Europa/Madrid (GMT+1)</option>
                                <option value="America/New_York">América/Nueva York (GMT-5)</option>
                                <option value="America/Los_Angeles">América/Los Ángeles (GMT-8)</option>
                                <option value="Asia/Tokyo">Asia/Tokio (GMT+9)</option>
                                <option value="Europe/London">Europa/Londres (GMT+0)</option>
                            </select>
                        </div>
                    </div>
                    <div className={`p-4 rounded-md ${user?.plan === 'pro' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className={`text-sm font-medium ${user?.plan === 'pro' ? 'text-emerald-800' : 'text-blue-800'}`}>
                                    Plan Actual: {user?.plan?.toUpperCase() || 'CARGANDO...'}
                                </h3>
                                <div className={`mt-2 text-sm ${user?.plan === 'pro' ? 'text-emerald-700' : 'text-blue-700'}`}>
                                    <p>
                                        {user?.plan === 'pro' ? (
                                            '¡Tienes acceso completo a todas las funciones Pro! Gracias por ser usuario premium.'
                                        ) : user?.plan === 'free' ? (
                                            'Tienes acceso a las funciones básicas. Considera actualizar para obtener más funciones.'
                                        ) : (
                                            'Cargando información del plan...'
                                        )}
                                    </p>
                                    {user?.plan && (
                                        <p className="mt-1 font-medium">
                                            Límite de solicitudes: {user.plan === 'pro' ? '5,000' : '1,000'} por mes
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
                    </div>
                </div>
                <div className="px-6 py-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Notificaciones por Email</h3>
                            <p className="text-sm text-gray-500">Recibir alertas de uso y actualizaciones de facturación por email</p>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('email', !notifications.email)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.email ? 'bg-emerald-600' : 'bg-gray-200'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.email ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {/* Botón de prueba - Solo email */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="mb-2">
                            <p className="text-xs text-gray-600">
                                📧 Las notificaciones se enviarán por email
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
}