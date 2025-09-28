"use client";

import {
    BarChart3,
    Copy,
    Eye,
    EyeOff,
    Plus,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { backendServiceDev, ApiKeyData, CreateApiKeyRequest } from "@/services/backendServiceDev";

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKey, setNewKey] = useState({ name: "", plan: "starter" });
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    // Cargar API keys reales del backend
    useEffect(() => {
        loadApiKeys();
    }, []);

    const loadApiKeys = async () => {
        try {
            console.log('🔄 Loading API keys...');
            setLoading(true);
            const apiKeys = await backendServiceDev.getApiKeys();
            console.log('✅ API keys loaded:', apiKeys);
            setKeys(apiKeys);
        } catch (error) {
            console.error('❌ Error loading API keys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (!newKey.name.trim()) return;

        try {
            const request: CreateApiKeyRequest = {
                name: newKey.name,
                plan: newKey.plan,
            };
            
            const createdKey = await backendServiceDev.createApiKey(request);
            setKeys([createdKey, ...keys]);
            setNewKey({ name: "", plan: "starter" });
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating API key:', error);
            alert('Error al crear la clave API');
        }
    };

    const handleDeleteKey = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta clave API?')) {
            try {
                await backendServiceDev.deleteApiKey(id);
                setKeys(keys.filter(key => key.id !== id));
            } catch (error) {
                console.error('Error deleting API key:', error);
                alert('Error al eliminar la clave API');
            }
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleKeyVisibility = (id: string) => {
        const newVisibleKeys = new Set(visibleKeys);
        if (newVisibleKeys.has(id)) {
            newVisibleKeys.delete(id);
        } else {
            newVisibleKeys.add(id);
        }
        setVisibleKeys(newVisibleKeys);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Claves API</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Gestiona tus claves API y supervisa su uso
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Crear Clave API
                </button>
            </div>

            {/* Create key form */}
            {showCreateForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New API Key</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Key Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={newKey.name}
                                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="My API Key"
                            />
                        </div>
                        <div>
                            <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                Plan
                            </label>
                            <select
                                id="plan"
                                value={newKey.plan}
                                onChange={(e) => setNewKey({ ...newKey, plan: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            >
                                <option value="starter">Starter (1,000 requests)</option>
                                <option value="pro">Pro (5,000 requests)</option>
                                <option value="enterprise">Enterprise (Unlimited)</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleCreateKey}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Create Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Tus Claves API</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {keys.length} API key{keys.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                <div className="divide-y divide-gray-200">
                    {keys.map((key) => (
                        <div key={key.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="flex items-center">
                                            <h3 className="text-sm font-medium text-gray-900">{key.name}</h3>
                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.plan === "starter"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : key.plan === "pro"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-emerald-100 text-emerald-800"
                                                }`}>
                                                {key.plan.charAt(0).toUpperCase() + key.plan.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <code className="text-xs text-gray-500">
                                                {visibleKeys.has(key.id) ? `${key.key_prefix}*****` : `${key.key_prefix}********************`}
                                            </code>
                                            <button
                                                onClick={() => toggleKeyVisibility(key.id)}
                                                className="ml-2 text-gray-400 hover:text-gray-600"
                                            >
                                                {visibleKeys.has(key.id) ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(key.key_prefix, key.id)}
                                                className="ml-2 text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedKey === key.id ? (
                                                    <Copy className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {key.usage_count}{key.usage_limit !== -1 ? `/${key.usage_limit}` : "/∞"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Last used {formatDate(key.last_used)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Usage progress bar */}
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full"
                                        style={{
                                            width: key.usage_limit === -1
                                                ? "0%"
                                                : `${(key.usage_count / (key.usage_limit || 1)) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{key.usage_count} requests</span>
                                    <span>
                                        {key.usage_limit === -1 ? "Unlimited" : `${key.usage_limit} limit`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty state */}
            {keys.length === 0 && !loading && (
                <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin claves API</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new API key.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            Create API Key
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}