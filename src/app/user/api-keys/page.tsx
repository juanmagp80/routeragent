'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { backendService, type ApiKeyData, type CreateApiKeyRequest } from '@/services/backendService';
import { motion } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    BarChart3,
    Calendar,
    Copy,
    Eye,
    EyeOff,
    Key,
    Loader2,
    Plus,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ApiKeysPage() {
    const { user, loading: authLoading, isHydrated } = useAuth();
    const router = useRouter();

    const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
    const { showSuccess, showError, confirm } = useNotifications();

    const [newKey, setNewKey] = useState<CreateApiKeyRequest>({
        name: '',
        user_id: '',
        usage_limit: 1000,
        plan: 'free'
    });

    // Verificar autenticación
    useEffect(() => {
        if (isHydrated && !authLoading) {
            if (!user) {
                router.push('/login');
            } else {
                loadApiKeys();
            }
        }
    }, [user, authLoading, isHydrated, router]);

    const loadApiKeys = async () => {
        try {
            setLoading(true);
            const keys = await backendService.getApiKeys();
            setApiKeys(keys);
        } catch (error) {
            console.error('Error loading API keys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newKey.name.trim()) return;

        // Verificar sesión activa en Supabase antes de crear la API key
        const session = await import('@/config/database').then(m => m.supabase.auth.getSession());
        if (!session.data.session) {
            showError('Debes iniciar sesión para crear una API key.');
            setCreating(false);
            return;
        }

        try {
            setCreating(true);
            const apiKey = await backendService.createApiKey(newKey);
            setApiKeys(prev => [apiKey, ...prev]);
            setCreateDialogOpen(false);
            setNewKey({
                name: '',
                user_id: user.id,
                usage_limit: 1000,
                plan: 'free'
            });
            showSuccess('API key creada exitosamente');
        } catch (error) {
            console.error('Error creating API key:', error);
            showError('Error al crear la API key');
        } finally {
            setCreating(false);
        }
    };

    const handleDeactivateKey = async (keyId: string) => {
        confirm(
            '¿Estás seguro de que quieres desactivar esta API key?',
            async () => {
                try {
                    await backendService.deactivateApiKey(keyId);
                    setApiKeys(prev => prev.map(key =>
                        key.id === keyId ? { ...key, is_active: false } : key
                    ));
                    showSuccess('API key desactivada exitosamente');
                } catch (error) {
                    console.error('Error deactivating API key:', error);
                    showError('Error al desactivar la API key');
                }
            }
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showSuccess('API key copiada al portapapeles');
    }; const toggleKeyVisibility = (keyId: string) => {
        setVisibleKeys(prev => ({
            ...prev,
            [keyId]: !prev[keyId]
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'free': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'pro': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'enterprise': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (authLoading || !isHydrated) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/user')}
                                className="text-slate-400 hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Dashboard
                            </Button>
                            <div className="h-6 w-px bg-slate-600" />
                            <h1 className="text-xl font-bold">🔑 Gestión de API Keys</h1>
                        </div>

                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-500 hover:bg-emerald-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva API Key
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700">
                                <DialogHeader>
                                    <DialogTitle className="text-white">Crear Nueva API Key</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Crea una nueva clave de API para acceder al router de modelos
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateKey} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="text-white">Nombre</Label>
                                        <Input
                                            id="name"
                                            placeholder="Mi API Key"
                                            value={newKey.name}
                                            onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                                            className="bg-slate-700 border-slate-600 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="usage-limit" className="text-white">Límite de uso</Label>
                                        <Input
                                            id="usage-limit"
                                            type="number"
                                            placeholder="1000"
                                            value={newKey.usage_limit}
                                            onChange={(e) => setNewKey(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || 1000 }))}
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="plan" className="text-white">Plan</Label>
                                        <Select
                                            value={newKey.plan}
                                            onValueChange={(value) => setNewKey(prev => ({ ...prev, plan: value }))}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-700 border-slate-600">
                                                <SelectItem value="free">Free</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button type="submit" disabled={creating} className="w-full bg-emerald-500 hover:bg-emerald-600">
                                        {creating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            'Crear API Key'
                                        )}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {apiKeys.length === 0 ? (
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Key className="h-12 w-12 text-slate-600 mb-4" />
                                    <h3 className="text-lg font-medium text-white mb-2">No tienes API Keys</h3>
                                    <p className="text-slate-400 text-center max-w-md mb-6">
                                        Crea tu primera API key para comenzar a usar el router de modelos de IA
                                    </p>
                                    <Button onClick={() => setCreateDialogOpen(true)} className="bg-emerald-500 hover:bg-emerald-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear API Key
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {apiKeys.map((apiKey, index) => (
                                    <motion.div
                                        key={apiKey.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="bg-slate-800 border-slate-700">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-3 h-3 rounded-full ${apiKey.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        <CardTitle className="text-white">{apiKey.name}</CardTitle>
                                                        <Badge className={getPlanColor(apiKey.plan)}>
                                                            {apiKey.plan}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleKeyVisibility(apiKey.id)}
                                                            className="text-slate-400 hover:text-white"
                                                        >
                                                            {visibleKeys[apiKey.id] ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeactivateKey(apiKey.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                            disabled={!apiKey.is_active}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardDescription className="text-slate-400">
                                                    Creada el {formatDate(apiKey.created_at)}
                                                    {apiKey.last_used_at && ` • Última vez usada: ${formatDate(apiKey.last_used_at)}`}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* API Key Display */}
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 bg-slate-700 rounded-lg p-3 font-mono text-sm">
                                                        {visibleKeys[apiKey.id]
                                                            ? `${apiKey.key_prefix}...`
                                                            : '••••••••••••••••••••••••••••••••'
                                                        }
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(`${apiKey.key_prefix}...`)}
                                                        className="border-slate-600 text-slate-400 hover:text-white"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Usage Stats */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <Activity className="h-4 w-4 text-blue-400 mr-1" />
                                                        </div>
                                                        <div className="text-lg font-bold text-white">
                                                            {apiKey.usage_count.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            de {apiKey.usage_limit.toLocaleString()} requests
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <BarChart3 className="h-4 w-4 text-emerald-400 mr-1" />
                                                        </div>
                                                        <div className="text-lg font-bold text-white">
                                                            {Math.round((apiKey.usage_count / apiKey.usage_limit) * 100)}%
                                                        </div>
                                                        <div className="text-xs text-slate-400">usado</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <Calendar className="h-4 w-4 text-purple-400 mr-1" />
                                                        </div>
                                                        <div className="text-lg font-bold text-white">
                                                            {apiKey.is_active ? 'Activa' : 'Inactiva'}
                                                        </div>
                                                        <div className="text-xs text-slate-400">estado</div>
                                                    </div>
                                                </div>

                                                {/* Usage Progress Bar */}
                                                <div className="w-full bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${(apiKey.usage_count / apiKey.usage_limit) > 0.8
                                                            ? 'bg-red-500'
                                                            : (apiKey.usage_count / apiKey.usage_limit) > 0.6
                                                                ? 'bg-yellow-500'
                                                                : 'bg-emerald-500'
                                                            }`}
                                                        style={{
                                                            width: `${Math.min((apiKey.usage_count / apiKey.usage_limit) * 100, 100)}%`
                                                        }}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
