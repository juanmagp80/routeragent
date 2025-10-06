'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { backendService, type RouteRequest, type RouteResponse } from '@/services/backendService';
import { Activity, CheckCircle, DollarSign, Loader2, XCircle, Zap } from 'lucide-react';
import { useState } from 'react';

export default function ApiTestPage() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<RouteResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [request, setRequest] = useState<RouteRequest>({
        input: '',
        task_type: 'general',
        model_preferences: {
            quality_target: 'medium',
            cost_target: 'medium'
        }
    });

    const [metrics, setMetrics] = useState<any>(null);
    const [backendHealth, setBackendHealth] = useState<boolean | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.input.trim()) return;

        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await backendService.routeTask(request);
            setResponse(result);
        } catch (err: any) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const checkBackendHealth = async () => {
        try {
            const isHealthy = await backendService.healthCheck();
            setBackendHealth(isHealthy);
        } catch (err) {
            setBackendHealth(false);
        }
    };

    const loadMetrics = async () => {
        try {
            const metricsData = await backendService.getMetrics();
            setMetrics(metricsData);
        } catch (err) {
            console.error('Error loading metrics:', err);
        }
    };

    const clearCache = async () => {
        try {
            await backendService.clearCache();
            alert('Cache limpiado exitosamente');
        } catch (err) {
            alert('Error al limpiar cache');
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">🧪 Test de API AgentRouter</h1>
                <p className="text-muted-foreground">
                    Prueba la funcionalidad del router de modelos de IA
                </p>
            </div>

            <Tabs defaultValue="test" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="test">Prueba de Router</TabsTrigger>
                    <TabsTrigger value="metrics">Métricas</TabsTrigger>
                    <TabsTrigger value="health">Estado del Sistema</TabsTrigger>
                    <TabsTrigger value="cache">Gestión de Cache</TabsTrigger>
                </TabsList>

                <TabsContent value="test" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Formulario de prueba */}
                        <Card>
                            <CardHeader>
                                <CardTitle>🎯 Configuración de Prueba</CardTitle>
                                <CardDescription>
                                    Configure los parámetros para probar el router
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="input">Texto de entrada</Label>
                                        <Textarea
                                            id="input"
                                            placeholder="Escribe aquí el texto que quieres procesar..."
                                            value={request.input}
                                            onChange={(e) => setRequest(prev => ({ ...prev, input: e.target.value }))}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="task-type">Tipo de tarea</Label>
                                        <Select
                                            value={request.task_type}
                                            onValueChange={(value: any) => setRequest(prev => ({ ...prev, task_type: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">General</SelectItem>
                                                <SelectItem value="summary">Resumen</SelectItem>
                                                <SelectItem value="translation">Traducción</SelectItem>
                                                <SelectItem value="analysis">Análisis</SelectItem>
                                                <SelectItem value="coding">Programación</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Calidad objetivo</Label>
                                            <Select
                                                value={request.model_preferences?.quality_target}
                                                onValueChange={(value: any) => setRequest(prev => ({
                                                    ...prev,
                                                    model_preferences: { ...prev.model_preferences, quality_target: value }
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Baja</SelectItem>
                                                    <SelectItem value="medium">Media</SelectItem>
                                                    <SelectItem value="high">Alta</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Costo objetivo</Label>
                                            <Select
                                                value={request.model_preferences?.cost_target}
                                                onValueChange={(value: any) => setRequest(prev => ({
                                                    ...prev,
                                                    model_preferences: { ...prev.model_preferences, cost_target: value }
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Bajo</SelectItem>
                                                    <SelectItem value="medium">Medio</SelectItem>
                                                    <SelectItem value="high">Alto</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full">
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            '🚀 Probar Router'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Resultado */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📊 Resultado</CardTitle>
                                <CardDescription>
                                    Respuesta del router de modelos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center space-x-2 p-4 border border-red-200 rounded-lg bg-red-50">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <span className="text-red-700">{error}</span>
                                    </div>
                                )}

                                {response && (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="font-medium text-green-700">Procesado exitosamente</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline">{response.selected_model}</Badge>
                                                <span className="text-sm text-muted-foreground">Modelo seleccionado</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="font-mono">${response.cost.toFixed(6)}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium mb-2">Respuesta:</h4>
                                            <p className="text-sm whitespace-pre-wrap">{response.response}</p>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <Activity className="h-4 w-4" />
                                                <span>Tiempo: {response.estimated_time}ms</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Zap className="h-4 w-4" />
                                                <span>IA Real: {response.is_real_ai ? 'Sí' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="metrics">
                    <Card>
                        <CardHeader>
                            <CardTitle>📈 Métricas del Sistema</CardTitle>
                            <CardDescription>
                                Estadísticas de uso y rendimiento
                            </CardDescription>
                            <Button onClick={loadMetrics} variant="outline">
                                Cargar Métricas
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {metrics && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{metrics.summary?.total_requests || 0}</div>
                                            <div className="text-sm text-muted-foreground">Total Requests</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">${(metrics.summary?.total_cost || 0).toFixed(4)}</div>
                                            <div className="text-sm text-muted-foreground">Costo Total</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">${(metrics.summary?.avg_cost_per_request || 0).toFixed(6)}</div>
                                            <div className="text-sm text-muted-foreground">Costo Promedio</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health">
                    <Card>
                        <CardHeader>
                            <CardTitle>🏥 Estado del Sistema</CardTitle>
                            <CardDescription>
                                Verificar conectividad con el backend
                            </CardDescription>
                            <Button onClick={checkBackendHealth} variant="outline">
                                Verificar Estado
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {backendHealth !== null && (
                                <div className={`flex items-center space-x-2 p-4 rounded-lg ${backendHealth
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                                    }`}>
                                    {backendHealth ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-green-700">Backend funcionando correctamente</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            <span className="text-red-700">Backend no disponible</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cache">
                    <Card>
                        <CardHeader>
                            <CardTitle>🗄️ Gestión de Cache</CardTitle>
                            <CardDescription>
                                Administrar el cache del sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={clearCache} variant="destructive">
                                Limpiar Cache
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
