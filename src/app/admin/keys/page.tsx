"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ApiKeyData, backendServiceDev, CreateApiKeyRequest } from "@/services/backendServiceDev";
import {
    Activity,
    BarChart3,
    CheckCircle,
    Copy,
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Claves API</h1>
                    <p className="text-gray-600">Administra tus claves de acceso a la API</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Clave API
                </button>
            </div>

            {/* Estadísticas de uso */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso del Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{keys.length}/5</div>
                        <div className="text-sm text-gray-600">claves usadas • Plan {planNames[userPlan as keyof typeof planNames]}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {totalUsage.toLocaleString()}/{planLimit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Uso total: requests</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{keys.filter(k => k.is_active).length}</div>
                        <div className="text-sm text-gray-600">claves activas</div>
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

            {showCreateForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Nueva Clave API</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre de la Clave
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={newKey.name}
                                onChange={(e) => setNewKey({ name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Mi Clave API"
                            />
                        </div>
                        <div>
                            <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                Plan
                            </label>
                            <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm text-gray-900">
                                <span className="font-medium">{planNames[userPlan as keyof typeof planNames]}</span>
                                <span className="text-gray-500 ml-2">({planLimits[userPlan as keyof typeof planLimits]})</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Plan basado en tu suscripción actual
                            </p>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleCreateKey}
                                disabled={!newKey.name.trim()}
                                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${newKey.name.trim()
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Crear Clave
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Tus Claves API
                    </h3>

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
                            {keys.map((key) => (
                                <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="text-lg font-medium text-gray-900">{key.name}</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    <Activity className="mr-1 h-3 w-3" />
                                                    {key.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                <div>
                                                    <div className="text-sm text-gray-500">Prefijo</div>
                                                    <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                        {key.key_prefix}***
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Uso</div>
                                                    <div className="text-sm font-semibold">
                                                        {key.usage_count.toLocaleString()} requests
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Creada</div>
                                                    <div className="text-sm">
                                                        {new Date(key.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleDeleteKey(key.id)}
                                                className="p-2 text-red-600 hover:text-red-700"
                                                title="Eliminar clave"
                                            >
                                                <Trash2 className="h-5 w-5" />
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