"use client";

import { supabase } from "@/config/database";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";
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
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const { theme, setTheme, themes, resolvedTheme } = useTheme();
    const { showSuccess, showError, showWarning } = useNotifications();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Estados para configuraciones del perfil
    const [profileSettings, setProfileSettings] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: '',
        role: 'User',
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

    // Cargar datos del perfil desde la base de datos
    const loadProfileData = async () => {
        if (!user?.id) return;

        setLoadingProfile(true);
        try {
            const { data: profile, error } = await supabase
                .from('users')
                .select('name, email, company, role, timezone, language')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (profile) {
                setProfileSettings({
                    name: profile.name || '',
                    email: profile.email || '',
                    company: profile.company || '',
                    role: profile.role || 'User',
                    timezone: profile.timezone || 'Europe/Madrid',
                    language: profile.language || 'es'
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showError('Error al cargar los datos del perfil');
        } finally {
            setLoadingProfile(false);
        }
    };

    // Validar campos del perfil
    const validateProfile = () => {
        const errors = [];

        if (!profileSettings.name.trim()) {
            errors.push('El nombre es obligatorio');
        }

        if (!profileSettings.email.trim()) {
            errors.push('El email es obligatorio');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileSettings.email)) {
            errors.push('El formato del email no es válido');
        }

        return errors;
    };

    // Actualizar perfil en la base de datos
    const updateProfile = async () => {
        if (!user?.id) return false;

        // Validar campos
        const validationErrors = validateProfile();
        if (validationErrors.length > 0) {
            showError(`Errores de validación: ${validationErrors.join(', ')}`);
            return false;
        }

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: profileSettings.name,
                    company: profileSettings.company,
                    role: profileSettings.role,
                    timezone: profileSettings.timezone,
                    language: profileSettings.language
                })
                .eq('id', user.id);

            if (error) throw error;

            showSuccess('Perfil actualizado exitosamente');
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            showError('Error al actualizar el perfil');
            return false;
        }
    };

    // Cargar configuración guardada al iniciar
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);

                // Cargar configuraciones de API si existen
                if (settings.apiSettings) {
                    setApiSettings(settings.apiSettings);
                }

                console.log('✅ Configuración cargada desde localStorage');
            }
        } catch (error) {
            console.warn('⚠️ Error cargando configuración guardada:', error);
        }

        // Cargar datos del perfil
        loadProfileData();
    }, [user?.id]);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            let allSuccessful = true;

            // Actualizar perfil en la base de datos si estamos en la pestaña de perfil
            if (activeTab === 'profile') {
                const profileUpdated = await updateProfile();
                allSuccessful = allSuccessful && profileUpdated;
            }

            // Guardar configuración del tema explícitamente
            localStorage.setItem('theme', theme);

            // Guardar otras configuraciones (API settings, etc.)
            const settingsToSave = {
                theme: theme,
                apiSettings: apiSettings,
                preferences: preferences,
                securitySettings: securitySettings,
                savedAt: new Date().toISOString()
            };

            localStorage.setItem('userSettings', JSON.stringify(settingsToSave));

            if (allSuccessful) {
                setMessage('Configuración guardada exitosamente');
                showSuccess('Configuración guardada exitosamente');
            } else {
                showWarning('Algunas configuraciones no se pudieron guardar');
            }

        } catch (err) {
            console.error('Error saving settings:', err);
            showError('Error al guardar la configuración');
            setMessage('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96 bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6 bg-background text-foreground min-h-screen transition-colors">
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
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                        <div className="bg-card dark:bg-card rounded-2xl shadow-lg border border-border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-2">
                                    <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-card-foreground">
                                    Información del Perfil
                                </h2>
                                {loadingProfile && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Nombre completo *
                                        </label>
                                        <input
                                            type="text"
                                            value={profileSettings.name}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))}
                                            disabled={loadingProfile}
                                            required
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                                                ${!profileSettings.name.trim() ? 'border-red-300 bg-red-50' : 'border-border bg-background'}
                                                ${loadingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            placeholder="Ingresa tu nombre completo"
                                        />
                                        {!profileSettings.name.trim() && (
                                            <p className="text-red-500 text-xs mt-1">El nombre es obligatorio</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={profileSettings.email}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            disabled={loadingProfile}
                                            required
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                                                ${(!profileSettings.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileSettings.email)) ? 'border-red-300 bg-red-50' : 'border-border bg-background'}
                                                ${loadingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            placeholder="tu@email.com"
                                        />
                                        {!profileSettings.email.trim() && (
                                            <p className="text-red-500 text-xs mt-1">El email es obligatorio</p>
                                        )}
                                        {profileSettings.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileSettings.email) && (
                                            <p className="text-red-500 text-xs mt-1">Formato de email inválido</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Empresa
                                        </label>
                                        <input
                                            type="text"
                                            value={profileSettings.company}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                company: e.target.value
                                            }))}
                                            disabled={loadingProfile}
                                            className={`w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                                                ${loadingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            placeholder="Nombre de tu empresa (opcional)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Rol
                                        </label>
                                        <select
                                            value={profileSettings.role}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                role: e.target.value
                                            }))}
                                            disabled={loadingProfile}
                                            className={`w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                                                ${loadingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
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
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Zona horaria
                                        </label>
                                        <select
                                            value={profileSettings.timezone}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                timezone: e.target.value
                                            }))}
                                            disabled={loadingProfile}
                                            className={`w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                                                ${loadingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                            <option value="Europe/London">London (GMT)</option>
                                            <option value="America/New_York">New York (GMT-5)</option>
                                            <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Idioma
                                        </label>
                                        <select
                                            value={profileSettings.language}
                                            onChange={(e) => setProfileSettings(prev => ({
                                                ...prev,
                                                language: e.target.value
                                            }))}
                                            disabled={loadingProfile}
                                            className={`w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors
                                                ${loadingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-6 border-t border-border">
                                    <div className="text-sm text-muted-foreground">
                                        * Campos obligatorios
                                    </div>
                                    <button
                                        onClick={async () => {
                                            setSaving(true);
                                            const success = await updateProfile();
                                            setSaving(false);
                                        }}
                                        disabled={saving || loadingProfile || !profileSettings.name.trim() || !profileSettings.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileSettings.email)}
                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        {saving ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {saving ? 'Guardando...' : 'Guardar Perfil'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-emerald-100 dark:bg-emerald-900 rounded-lg p-2">
                                    <Palette className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-card-foreground">
                                    Preferencias de la Aplicación
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {/* Tema */}
                                <div>
                                    <h3 className="text-lg font-medium text-card-foreground mb-4">Tema de la Interfaz</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {themes.map((themeOption) => {
                                            const IconComponent = themeOption.value === 'light' ? Sun :
                                                themeOption.value === 'dark' ? Moon : Monitor;
                                            return (
                                                <button
                                                    key={themeOption.value}
                                                    onClick={() => setTheme(themeOption.value)}
                                                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${theme === themeOption.value
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                                        : 'border-border bg-card text-card-foreground hover:border-accent'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="text-3xl">
                                                            {themeOption.icon}
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium">{themeOption.label}</p>
                                                            {themeOption.value === 'system' && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Actual: {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-3">
                                        {theme === 'system'
                                            ? 'El tema se ajustará automáticamente según las preferencias de tu sistema'
                                            : `Tema ${theme === 'light' ? 'claro' : 'oscuro'} seleccionado`
                                        }
                                    </p>
                                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                                        <Save className="h-3 w-3" />
                                        El tema se guarda automáticamente al seleccionarlo
                                    </p>
                                </div>

                                {/* Configuraciones de toggle */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-card-foreground">Configuraciones Generales</h3>

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
