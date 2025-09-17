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

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKey, setNewKey] = useState({ name: "", plan: "starter" });
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    // Simular carga de API keys
    useEffect(() => {
        // En una implementación real, esto vendría de una API
        const mockKeys = [
            {
                id: "ak_1",
                name: "Production Key",
                key: "ar_prod_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a",
                prefix: "ar_prod_6f7ccf789",
                plan: "pro",
                usage_count: 1247,
                usage_limit: 5000,
                created_at: "2025-09-15T10:30:00Z",
                last_used: "2025-09-17T14:22:00Z",
                is_active: true
            },
            {
                id: "ak_2",
                name: "Development Key",
                key: "ar_dev_a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
                prefix: "ar_dev_a1b2c3d4e",
                plan: "starter",
                usage_count: 89,
                usage_limit: 1000,
                created_at: "2025-09-10T09:15:00Z",
                last_used: "2025-09-17T11:45:00Z",
                is_active: true
            }
        ];

        setTimeout(() => {
            setKeys(mockKeys);
            setLoading(false);
        }, 500);
    }, []);

    const handleCreateKey = () => {
        if (!newKey.name.trim()) return;

        const createdKey = {
            id: `ak_${Date.now()}`,
            name: newKey.name,
            key: `ar_${newKey.name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 15)}`,
            prefix: `ar_${newKey.name.toLowerCase().substring(0, 8)}`,
            plan: newKey.plan,
            usage_count: 0,
            usage_limit: newKey.plan === "starter" ? 1000 : newKey.plan === "pro" ? 5000 : -1,
            created_at: new Date().toISOString(),
            last_used: null,
            is_active: true
        };

        setKeys([createdKey, ...keys]);
        setNewKey({ name: "", plan: "starter" });
        setShowCreateForm(false);
    };

    const handleDeleteKey = (id: string) => {
        setKeys(keys.filter(key => key.id !== id));
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
                    <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your API keys and track usage
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Create API Key
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
                    <h2 className="text-lg font-semibold text-gray-900">Your API Keys</h2>
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
                                                {visibleKeys.has(key.id) ? key.key : `${key.prefix}********************`}
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
                                                onClick={() => copyToClipboard(key.key, key.id)}
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
                                                : `${(key.usage_count / key.usage_limit) * 100}%`
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
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