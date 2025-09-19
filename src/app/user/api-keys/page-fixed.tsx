'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { backendService, type ApiKeyData, type CreateApiKeyRequest } from '@/services/backendService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Loader2, 
    Plus, 
    Key, 
    Copy, 
    Trash2, 
    Eye, 
    EyeOff, 
    ArrowLeft,
    Activity,
    Calendar,
    BarChart3,
    Settings,
    TrendingUp,
    Shield,
    Clock,
    CheckCircle,
    AlertTriangle,
    Zap,
    Crown,
    Building2,
    DollarSign,
    Users
} from 'lucide-react';
import { motion } from 'framer-motion';

// Componentes simples en línea para evitar problemas de dependencias
const Input = ({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
);

const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label
        className={`text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
    />
);

const Select = ({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        className={`flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    >
        {children}
    </select>
);

const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
    if (!open) return null;
    
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                <button 
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};

const Tabs = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => (
    <div className="space-y-6">{children}</div>
);

const TabsList = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 flex space-x-1">{children}</div>
);

const TabsTrigger = ({ value, isActive, onClick, children }: { value: string; isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
            isActive ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
        }`}
    >
        {children}
    </button>
);

const TabsContent = ({ value, activeValue, children }: { value: string; activeValue: string; children: React.ReactNode }) => {
    if (value !== activeValue) return null;
    return <div>{children}</div>;
};

const Progress = ({ value, className }: { value: number; className?: string }) => (
    <div className={`w-full bg-slate-700 rounded-full h-2 ${className}`}>
        <div
            className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(value, 100)}%` }}
        />
    </div>
);

export default function ApiKeysPage() {
    const { user, loading: authLoading, isHydrated } = useAuth();
    const router = useRouter();
    
    const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState('keys');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    
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
        } catch (error) {
            console.error('Error creating API key:', error);
            alert('Error al crear la API key');
        } finally {
            setCreating(false);
        }
    };

    const handleDeactivateKey = async (keyId: string) => {
        if (!confirm('¿Estás seguro de que quieres desactivar esta API key?')) return;

        try {
            await backendService.deactivateApiKey(keyId);
            setApiKeys(prev => prev.map(key => 
                key.id === keyId ? { ...key, is_active: false } : key
            ));
        } catch (error) {
            console.error('Error deactivating API key:', error);
            alert('Error al desactivar la API key');
        }
    };

    const copyToClipboard = async (text: string, keyId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(keyId);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    const toggleKeyVisibility = (keyId: string) => {
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

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'free': return <Zap className="h-4 w-4" />;
            case 'pro': return <Crown className="h-4 w-4" />;
            case 'enterprise': return <Building2 className="h-4 w-4" />;
            default: return <Zap className="h-4 w-4" />;
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
                        
                        <Button 
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva API Key
                        </Button>
                    </div>
                </div>
            </header>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <div className="relative">
                    <h2 className="text-lg font-semibold text-white mb-2">Crear Nueva API Key</h2>
                    <p className="text-slate-400 mb-4">
                        Crea una nueva clave de API para acceder al router de modelos
                    </p>
                    <form onSubmit={handleCreateKey} className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-white">Nombre</Label>
                            <Input
                                id="name"
                                placeholder="Mi API Key"
                                value={newKey.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1"
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKey(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || 1000 }))}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="plan" className="text-white">Plan</Label>
                            <Select
                                value={newKey.plan}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewKey(prev => ({ ...prev, plan: e.target.value }))}
                                className="mt-1"
                            >
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="enterprise">Enterprise</option>
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
                </div>
            </Dialog>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger 
                            value="keys" 
                            isActive={activeTab === 'keys'}
                            onClick={() => setActiveTab('keys')}
                        >
                            <Key className="h-4 w-4 mr-2" />
                            API Keys
                        </TabsTrigger>
                        <TabsTrigger 
                            value="usage" 
                            isActive={activeTab === 'usage'}
                            onClick={() => setActiveTab('usage')}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Métricas de Uso
                        </TabsTrigger>
                        <TabsTrigger 
                            value="plans" 
                            isActive={activeTab === 'plans'}
                            onClick={() => setActiveTab('plans')}
                        >
                            <Crown className="h-4 w-4 mr-2" />
                            Planes
                        </TabsTrigger>
                        <TabsTrigger 
                            value="settings" 
                            isActive={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Configuración
                        </TabsTrigger>
                    </TabsList>

                    {/* API Keys Tab */}
                    <TabsContent value="keys" activeValue={activeTab}>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card className="bg-slate-800 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400">Total Keys</p>
                                                    <p className="text-2xl font-bold text-white">{apiKeys.length}</p>
                                                </div>
                                                <Key className="h-8 w-8 text-blue-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-slate-800 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400">Activas</p>
                                                    <p className="text-2xl font-bold text-emerald-400">
                                                        {apiKeys.filter(k => k.is_active).length}
                                                    </p>
                                                </div>
                                                <CheckCircle className="h-8 w-8 text-emerald-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-slate-800 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400">Requests Totales</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {apiKeys.reduce((sum, key) => sum + key.usage_count, 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Activity className="h-8 w-8 text-purple-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-slate-800 border-slate-700">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400">Plan Actual</p>
                                                    <p className="text-2xl font-bold text-white capitalize">
                                                        {(user as any)?.subscription?.plan || 'Free'}
                                                    </p>
                                                </div>
                                                <Crown className="h-8 w-8 text-yellow-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

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
                                                                    {getPlanIcon(apiKey.plan)}
                                                                    <span className="ml-1">{apiKey.plan}</span>
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
                                                                onClick={() => copyToClipboard(`${apiKey.key_prefix}...`, apiKey.id)}
                                                                className="border-slate-600 text-slate-400 hover:text-white"
                                                            >
                                                                {copiedKey === apiKey.id ? (
                                                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
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
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-400">Uso del límite</span>
                                                                <span className="text-white">
                                                                    {apiKey.usage_count} / {apiKey.usage_limit}
                                                                </span>
                                                            </div>
                                                            <Progress 
                                                                value={(apiKey.usage_count / apiKey.usage_limit) * 100}
                                                                className="h-2 bg-slate-700"
                                                            />
                                                        </div>

                                                        {/* Alert for high usage */}
                                                        {(apiKey.usage_count / apiKey.usage_limit) > 0.8 && (
                                                            <Alert className="border-yellow-500/50 bg-yellow-500/10">
                                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                                <AlertDescription className="text-yellow-500">
                                                                    Estás cerca del límite de tu API key. Considera actualizar tu plan.
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Usage Metrics Tab */}
                    <TabsContent value="usage" activeValue={activeTab}>
                        <div className="space-y-6">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2" />
                                        Métricas de Uso
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Análisis detallado del uso de tus API keys
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-slate-700 rounded-lg">
                                            <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-white">$0.00</div>
                                            <div className="text-sm text-slate-400">Costo total este mes</div>
                                        </div>
                                        <div className="text-center p-4 bg-slate-700 rounded-lg">
                                            <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-white">1.2s</div>
                                            <div className="text-sm text-slate-400">Tiempo de respuesta promedio</div>
                                        </div>
                                        <div className="text-center p-4 bg-slate-700 rounded-lg">
                                            <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-white">
                                                {apiKeys.reduce((sum, key) => sum + key.usage_count, 0)}
                                            </div>
                                            <div className="text-sm text-slate-400">Requests totales</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Modelos Más Utilizados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-300">GPT-4</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-slate-700 rounded-full h-2">
                                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                                </div>
                                                <span className="text-slate-400 text-sm">60%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-300">Claude 3</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-slate-700 rounded-full h-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                                </div>
                                                <span className="text-slate-400 text-sm">30%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-300">GPT-3.5</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-slate-700 rounded-full h-2">
                                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                                                </div>
                                                <span className="text-slate-400 text-sm">10%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Plans Tab */}
                    <TabsContent value="plans" activeValue={activeTab}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Free Plan */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Zap className="h-5 w-5 mr-2 text-gray-400" />
                                            Free
                                        </CardTitle>
                                        <div className="text-3xl font-bold text-white">$0</div>
                                        <CardDescription className="text-slate-400">
                                            Perfecto para probar
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                1,000 requests/mes
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                2 modelos disponibles
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                Soporte comunitario
                                            </li>
                                        </ul>
                                        <Button className="w-full" variant="outline" disabled>
                                            Plan Actual
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Pro Plan */}
                                <Card className="bg-slate-800 border-blue-500 relative">
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                        Recomendado
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Crown className="h-5 w-5 mr-2 text-blue-400" />
                                            Pro
                                        </CardTitle>
                                        <div className="text-3xl font-bold text-white">$29</div>
                                        <CardDescription className="text-slate-400">
                                            Para desarrolladores
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                10,000 requests/mes
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                8 modelos disponibles
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                Soporte por email
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                Métricas avanzadas
                                            </li>
                                        </ul>
                                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                                            Actualizar a Pro
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Enterprise Plan */}
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Building2 className="h-5 w-5 mr-2 text-purple-400" />
                                            Enterprise
                                        </CardTitle>
                                        <div className="text-3xl font-bold text-white">$99</div>
                                        <CardDescription className="text-slate-400">
                                            Para equipos grandes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                100,000 requests/mes
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                Todos los modelos
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                Soporte 24/7 prioritario
                                            </li>
                                            <li className="flex items-center text-slate-300">
                                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                                                Gestión de equipos
                                            </li>
                                        </ul>
                                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                                            Contactar Ventas
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" activeValue={activeTab}>
                        <div className="space-y-6">
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Shield className="h-5 w-5 mr-2" />
                                        Configuración de Seguridad
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Gestiona la seguridad de tus API keys
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-medium">Notificaciones de uso alto</div>
                                            <div className="text-sm text-slate-400">
                                                Recibe alertas cuando uses el 80% de tu límite
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Configurar
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-medium">Restricciones de IP</div>
                                            <div className="text-sm text-slate-400">
                                                Limita el acceso a tus API keys por dirección IP
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Configurar
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-medium">Webhook de eventos</div>
                                            <div className="text-sm text-slate-400">
                                                Recibe notificaciones en tiempo real de eventos
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Configurar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Users className="h-5 w-5 mr-2" />
                                        Gestión de Equipo
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Comparte acceso con tu equipo (Pro/Enterprise)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">
                                            Función disponible en planes Pro+
                                        </h3>
                                        <p className="text-slate-400 mb-4">
                                            Invita miembros del equipo y gestiona permisos
                                        </p>
                                        <Button className="bg-blue-500 hover:bg-blue-600">
                                            Actualizar Plan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
