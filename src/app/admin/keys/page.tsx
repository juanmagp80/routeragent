"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ApiKeyData, backendServiceDev, CreateApiKeyRequest } from "@/services/backendServiceDev";
import {
    Activity,
    BarChart3,
    CheckCircle,
    Copy,
    Key,
    Plus,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

interface CreatedApiKey {
    id: string;
    name: string;
    key_prefix: string;
    full_key: string;
    plan: string;
    usage_limit: number;
    usage_count: number;
    is_active: boolean;
    created_at: string;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKeyData[]>([]);
    const [totalUsage, setTotalUsage] = useState<number>(0);
    const [planLimit, setPlanLimit] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKey, setNewKey] = useState({ name: "" });
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<CreatedApiKey | null>(null);
    const { user } = useAuth();

    // Obtener plan del usuario actual
    const userPlan = user?.plan || 'pro';
    const planNames = {
        free: 'Gratuito',
        starter: 'Starter',
        pro: 'Pro',
        enterprise: 'Enterprise'
    };
    const planLimits = {
        free: '100 requests',
        starter: '1,000 requests',
        pro: '5,000 requests',
        enterprise: 'Unlimited'
    };

    // Fetch API keys
    const fetchKeys = async () => {
        try {
            setLoading(true);
            const response = await backendServiceDev.getApiKeys();
            console.log('🔑 API Keys Response:', response);
            console.log('🔑 API Keys Array:', response.api_keys);
            console.log('🔑 Total Usage:', response.total_usage);

            if (response.api_keys) {
                setKeys(response.api_keys);
                setTotalUsage(response.total_usage || 0);
                setPlanLimit(response.plan_limit || 5000);
            } else {
                console.error('❌ No api_keys in response');
                setKeys(response);
            }
        } catch (error) {
            console.error('Error fetching API keys:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    // Create new API key
    const handleCreateKey = async () => {
        if (!newKey.name.trim()) return;

        try {
            const keyData: CreateApiKeyRequest = {
                name: newKey.name,
                plan: userPlan
            };
            const response = await backendServiceDev.createApiKey(keyData);
            console.log('🆕 Created API Key:', response);

            // Guardar la clave recién creada para mostrarla
            // La respuesta debería ser directamente el ApiKeyData con full_key
            setNewlyCreatedKey(response as any);

            await fetchKeys();
            setNewKey({ name: "" });
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating API key:', error);
            console.error('Error al crear la clave API. Por favor, inténtalo de nuevo.');
        }
    };

    // Delete API key
    const handleDeleteKey = async (keyId: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta clave API?')) {
            return;
        }

        try {
            await backendServiceDev.deleteApiKey(keyId);
            console.error('Clave API eliminada exitosamente');
            await fetchKeys();
        } catch (error) {
            console.error('Error deleting API key:', error);
            console.error('Error al eliminar la clave API. Por favor, inténtalo de nuevo.');
        }
    };

    // Copy key to clipboard
    const copyToClipboard = (text: string, keyId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header profesional */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Claves API</h1>
                            <p className="text-gray-600 mt-1">
                                Gestiona las claves de acceso para tus aplicaciones
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Claves activas</div>
                                <div className="text-lg font-semibold text-gray-900">{keys.length} de 5</div>
                            </div>
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                disabled={keys.length >= 5}
                                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    keys.length >= 5 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
                                }`}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {keys.length >= 5 ? 'Límite alcanzado' : 'Nueva clave'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Claves API</p>
                            <p className="text-2xl font-semibold text-gray-900">{keys.length} de 5</p>
                        </div>
                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                            <Key className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Plan {planNames[userPlan as keyof typeof planNames]}</span>
                            <span className="text-gray-900">{((keys.length / 5) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(keys.length / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    {keys.length >= 5 && (
                        <div className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-md p-2">
                            Límite alcanzado
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Uso mensual</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalUsage.toLocaleString()}</p>
                        </div>
                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                            <BarChart3 className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">de {planLimit.toLocaleString()} requests</span>
                            <span className="text-gray-900">{Math.min((totalUsage / planLimit) * 100, 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((totalUsage / planLimit) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Estado</p>
                            <p className="text-2xl font-semibold text-gray-900">{keys.filter(k => k.is_active).length}</p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                            <Activity className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Claves activas</p>
                        {keys.filter(k => k.is_active).length > 0 ? (
                            <div className="flex items-center text-sm text-green-700 bg-green-50 rounded-md p-2 mt-2">
                                <Activity className="mr-2 h-3 w-3" />
                                Todas operativas
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 mt-2">Sin claves activas</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nueva clave recién creada */}
            {newlyCreatedKey && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                ¡Clave API creada exitosamente!
                            </h3>
                            <p className="text-green-700 mb-4">
                                Guarda esta clave en un lugar seguro. <strong>No podrás verla nuevamente</strong> por motivos de seguridad.
                            </p>

                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-700">{newlyCreatedKey.name}</div>
                                        <div className="text-lg font-mono bg-gray-100 p-2 rounded mt-2 break-all">
                                            {newlyCreatedKey.full_key}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(newlyCreatedKey.full_key, 'new-key')}
                                        className="ml-4 p-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <Copy className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-3">
                                <button
                                    onClick={() => copyToClipboard(newlyCreatedKey.full_key, 'new-key')}
                                    className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    {copiedKey === 'new-key' ? 'Copiada!' : 'Copiar Clave'}
                                </button>
                                <button
                                    onClick={() => setNewlyCreatedKey(null)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCreateForm && keys.length < 5 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">
                            Crear nueva clave API
                        </h2>
                        <p className="text-gray-600">
                            Genera una nueva clave para integrar RouterAI en tus aplicaciones.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la clave
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={newKey.name}
                                onChange={(e) => setNewKey({ name: e.target.value })}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Ej: Mi App Producción"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Nombre descriptivo para identificar la clave
                            </p>
                        </div>
                        <div className="sm:col-span-1">
                            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                                Plan
                            </label>
                            <div className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-sm text-gray-900">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{planNames[userPlan as keyof typeof planNames]}</span>
                                    <span className="text-xs text-gray-500">
                                        {planLimits[userPlan as keyof typeof planLimits]}
                                    </span>
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Plan basado en tu suscripción actual
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateKey}
                            disabled={!newKey.name.trim()}
                            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${newKey.name.trim()
                                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Plus className="inline-block w-4 h-4 mr-2" />
                            Crear clave
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Lista de claves API
                        </h3>
                        {keys.length < 5 && !showCreateForm && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva clave
                            </button>
                        )}
                    </div>
                </div>
                <div className="p-6">

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="text-center py-12">
                            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay claves API</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Comienza creando tu primera clave API.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {keys.map((key, index) => (
                                <div key={key.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group animate-fade-in" style={{'--animation-delay': `${index * 100}ms`} as React.CSSProperties}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">{key.name}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Creada el {new Date(key.created_at).toLocaleDateString('es-ES', { 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric' 
                                                        })}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${key.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${key.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    {key.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                <div className="bg-gray-50 rounded-md p-3">
                                                    <div className="text-xs font-medium text-gray-500 mb-1">Prefijo</div>
                                                    <div className="text-sm font-mono bg-white px-2 py-1 rounded border text-gray-800">
                                                        {key.key_prefix}***
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-md p-3">
                                                    <div className="text-xs font-medium text-gray-500 mb-1">Uso</div>
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        {key.usage_count.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">requests</div>
                                                </div>
                                                <div className="bg-gray-50 rounded-md p-3">
                                                    <div className="text-xs font-medium text-gray-500 mb-1">Estado</div>
                                                    <div className="flex items-center">
                                                        <Activity className={`h-3 w-3 mr-1 ${key.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                                                        <span className="text-sm text-gray-700">
                                                            {key.is_active ? 'Operativa' : 'Pausada'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-6">
                                            <button
                                                onClick={() => handleDeleteKey(key.id)}
                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                                title="Eliminar clave API"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}