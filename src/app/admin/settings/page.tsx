"use client";

import { useAuth } from "@/hooks/useAuth";
import {
    AlertTriangle,
    Bell,
    Check,
    Eye,
    EyeOff,
    Key,
    Lock,
    Mail,
    Monitor,
    Moon,
    Palette,
    Save,
    Settings,
    Shield,
    Smartphone,
    Sun,
    Trash2,
    User,
    X
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);

    // Estados para configuraciones del perfil
    const [profileSettings, setProfileSettings] = useState({
        name: 'Juan Manuel García',
        email: 'juan@example.com',
        company: 'RouterAI Corp',
        role: 'Developer',
        timezone: 'Europe/Madrid',
        language: 'es'
    });

    // Estados para preferencias
    const [preferences, setPreferences] = useState({
        theme: 'light',
        notifications: true,
        emailUpdates: true,
        marketingEmails: false,
        autoSave: true,
        compactMode: false
    });

    // Estados para seguridad
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: '30',
        loginNotifications: true,
        apiKeyRotation: 'monthly'
    });

    // Estados para API
    const [apiSettings, setApiSettings] = useState({
        apiKey: 'ar_010e77064cf58e3899df709246d0667be2a1ff518350506d69995eeee69e34d4',
        rateLimiting: true,
        corsOrigins: ['https://myapp.com', 'https://localhost:3000'],
        webhookUrl: ''
    });

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            // Simular guardado
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage('Configuración guardada exitosamente');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error al guardar la configuración');
        } finally {
            setSaving(false);
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
                            <Settings className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Configuración</h1>
                            <p className="text-indigo-100 mt-1">
                                Personaliza tu experiencia RouterAI
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navegación lateral */}
                <div className="lg:w-64">
                    <nav className="space-y-2">
                        {[
                            { id: 'profile', label: 'Perfil', icon: User },
                            { id: 'preferences', label: 'Preferencias', icon: Palette },
                            { id: 'security', label: 'Seguridad', icon: Shield },
                            { id: 'api', label: 'API', icon: Key }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === id
                                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenido principal */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-100 rounded-lg p-2">
                                    <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Información del Perfil
                                </h2>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre completo
                                        </label>
                                        <input
                                            type="text"
                                            value={profileSettings.name}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={profileSettings.email}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Empresa
                                        </label>
                                        <input
                                            type="text"
                                            value={profileSettings.company}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                company: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rol
                                        </label>
                                        <select
                                            value={profileSettings.role}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                role: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="Developer">Developer</option>
                                            <option value="Product Manager">Product Manager</option>
                                            <option value="CTO">CTO</option>
                                            <option value="CEO">CEO</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Zona horaria
                                        </label>
                                        <select
                                            value={profileSettings.timezone}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                timezone: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                            <option value="Europe/London">London (GMT)</option>
                                            <option value="America/New_York">New York (GMT-5)</option>
                                            <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Idioma
                                        </label>
                                        <select
                                            value={profileSettings.language}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                language: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-emerald-100 rounded-lg p-2">
                                    <Palette className="h-5 w-5 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Preferencias de la Aplicación
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {/* Tema */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tema</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'light', label: 'Claro', icon: Sun },
                                            { id: 'dark', label: 'Oscuro', icon: Moon },
                                            { id: 'system', label: 'Sistema', icon: Monitor }
                                        ].map(({ id, label, icon: Icon }) => (
                                            <button
                                                key={id}
                                                onClick={() => setPreferences(prev => ({
                                                    ...prev,
                                                    theme: id
                                                }))}
                                                className={`p-4 rounded-lg border-2 transition-all ${preferences.theme === id
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                                <p className="text-sm font-medium text-gray-900">{label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Configuraciones de toggle */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Configuraciones Generales</h3>

                                    {[
                                        {
                                            key: 'notifications',
                                            label: 'Notificaciones',
                                            desc: 'Recibir notificaciones en el navegador',
                                            icon: Bell
                                        },
                                        {
                                            key: 'emailUpdates',
                                            label: 'Actualizaciones por email',
                                            desc: 'Recibir noticias y actualizaciones del producto',
                                            icon: Mail
                                        },
                                        {
                                            key: 'autoSave',
                                            label: 'Guardado automático',
                                            desc: 'Guardar cambios automáticamente',
                                            icon: Save
                                        },
                                        {
                                            key: 'compactMode',
                                            label: 'Modo compacto',
                                            desc: 'Interfaz más compacta y densa',
                                            icon: Monitor
                                        }
                                    ].map(({ key, label, desc, icon: Icon }) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{label}</p>
                                                    <p className="text-sm text-gray-500">{desc}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={preferences[key as keyof typeof preferences] as boolean}
                                                    onChange={(e) => setPreferences(prev => ({
                                                        ...prev,
                                                        [key]: e.target.checked
                                                    }))}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-red-100 rounded-lg p-2">
                                    <Shield className="h-5 w-5 text-red-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Configuración de Seguridad
                                </h2>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                        <p className="text-sm font-medium text-yellow-800">
                                            Configuraciones sensibles - maneja con cuidado
                                        </p>
                                    </div>
                                </div>

                                {/* Autenticación de dos factores */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Autenticación de dos factores</p>
                                            <p className="text-sm text-gray-500">Añade una capa extra de seguridad</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={securitySettings.twoFactorAuth}
                                            onChange={(e) => setSecuritySettings(prev => ({
                                                ...prev,
                                                twoFactorAuth: e.target.checked
                                            }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                {/* Timeout de sesión */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timeout de sesión (minutos)
                                    </label>
                                    <select
                                        value={securitySettings.sessionTimeout}
                                        onChange={(e) => setSecuritySettings(prev => ({
                                            ...prev,
                                            sessionTimeout: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="15">15 minutos</option>
                                        <option value="30">30 minutos</option>
                                        <option value="60">1 hora</option>
                                        <option value="240">4 horas</option>
                                    </select>
                                </div>

                                {/* Notificaciones de login */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Notificaciones de login</p>
                                            <p className="text-sm text-gray-500">Alertas cuando alguien accede a tu cuenta</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={securitySettings.loginNotifications}
                                            onChange={(e) => setSecuritySettings(prev => ({
                                                ...prev,
                                                loginNotifications: e.target.checked
                                            }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-100 rounded-lg p-2">
                                    <Key className="h-5 w-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Configuración de API
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {/* API Key */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        API Key
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type={showApiKey ? 'text' : 'password'}
                                                value={apiSettings.apiKey}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                                            />
                                            <button
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                            Rotar
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mantén tu API key segura y no la compartas públicamente
                                    </p>
                                </div>

                                {/* CORS Origins */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Orígenes CORS permitidos
                                    </label>
                                    <div className="space-y-2">
                                        {apiSettings.corsOrigins.map((origin, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={origin}
                                                    onChange={(e) => {
                                                        const newOrigins = [...apiSettings.corsOrigins];
                                                        newOrigins[index] = e.target.value;
                                                        setApiSettings(prev => ({
                                                            ...prev,
                                                            corsOrigins: newOrigins
                                                        }));
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="https://example.com"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newOrigins = apiSettings.corsOrigins.filter((_, i) => i !== index);
                                                        setApiSettings(prev => ({
                                                            ...prev,
                                                            corsOrigins: newOrigins
                                                        }));
                                                    }}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setApiSettings(prev => ({
                                                ...prev,
                                                corsOrigins: [...prev.corsOrigins, '']
                                            }))}
                                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                                        >
                                            + Añadir origen
                                        </button>
                                    </div>
                                </div>

                                {/* Webhook URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL de Webhook
                                    </label>
                                    <input
                                        type="url"
                                        value={apiSettings.webhookUrl}
                                        onChange={(e) => setApiSettings(prev => ({
                                            ...prev,
                                            webhookUrl: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="https://tu-app.com/webhook"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex items-center gap-4 mt-8">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>

                        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                    </div>

                    {/* Mensaje de estado */}
                    {message && (
                        <div className={`mt-4 p-4 rounded-lg text-center font-medium ${message.includes('Error')
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                            <div className="flex items-center justify-center gap-2">
                                {message.includes('Error') ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Check className="h-5 w-5" />
                                )}
                                {message}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
