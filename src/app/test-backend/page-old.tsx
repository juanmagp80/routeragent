'use client';

import React, { useState, useEffect } from 'react';
import { backendService, type RouteRequest, type RouteResponse } from '@/services/backendService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Server, Zap, DollarSign, Clock } from 'lucide-react';

export default function BackendTestPage() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [testInput, setTestInput] = useState('Explica qué es la inteligencia artificial en términos simples');
    const [taskType, setTaskType] = useState<RouteRequest['task_type']>('general');
    const [isRouting, setIsRouting] = useState(false);
    const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Verificar conexión al cargar
    useEffect(() => {
        checkBackendConnection();
    }, []);

    const checkBackendConnection = async () => {
        try {
            const connected = await backendService.healthCheck();
            setIsConnected(connected);
            
            if (connected) {
                const info = await backendService.getSystemInfo();
                setSystemInfo(info);
            }
        } catch (err) {
            setIsConnected(false);
            setError('Error al conectar con el backend');
        }
    };

    const testRouting = async () => {
        if (!testInput.trim()) return;

        setIsRouting(true);
        setError(null);
        setRouteResult(null);

        try {
            const request: RouteRequest = {
                input: testInput,
                task_type: taskType,
                model_preferences: {
                    quality_target: 'high',
                    cost_target: 'medium'
                }
            };

            const result = await backendService.routeTask(request);
            setRouteResult(result);
        } catch (err: any) {
            setError(err.message || 'Error al procesar la solicitud');
        } finally {
            setIsRouting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">
                        🚀 Test Backend RouterAI
                    </h1>
                    <p className="text-slate-300">
                        Prueba la conexión y funcionalidad del sistema de enrutamiento de IA
                    </p>
                </div>

                {/* Estado de Conexión */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Server className="w-5 h-5" />
                            Estado del Backend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            {isConnected === null ? (
                                <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                            ) : isConnected ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-slate-300">
                                {isConnected === null ? 'Verificando...' : 
                                 isConnected ? 'Conectado' : 'Desconectado'}
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={checkBackendConnection}
                                className="ml-auto"
                            >
                                Refrescar
                            </Button>
                        </div>

                        {systemInfo && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900 rounded-lg">
                                <div>
                                    <p className="text-sm text-slate-400">Mensaje</p>
                                    <p className="text-white">{systemInfo.message}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Versión</p>
                                    <p className="text-white">{systemInfo.version}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Prueba de Enrutamiento */}
                {isConnected && (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Zap className="w-5 h-5" />
                                Prueba de Enrutamiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">
                                    Texto de entrada
                                </label>
                                <Textarea
                                    value={testInput}
                                    onChange={(e) => setTestInput(e.target.value)}
                                    placeholder="Escribe aquí el texto que quieres procesar..."
                                    className="bg-slate-900 border-slate-600 text-white"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">
                                    Tipo de tarea
                                </label>
                                <select
                                    value={taskType}
                                    onChange={(e) => setTaskType(e.target.value as RouteRequest['task_type'])}
                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md text-white"
                                >
                                    <option value="general">General</option>
                                    <option value="summary">Resumen</option>
                                    <option value="translation">Traducción</option>
                                    <option value="analysis">Análisis</option>
                                    <option value="coding">Programación</option>
                                </select>
                            </div>

                            <Button 
                                onClick={testRouting}
                                disabled={isRouting || !testInput.trim()}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                {isRouting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    'Probar Enrutamiento'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Error */}
                {error && (
                    <Alert className="bg-red-900 border-red-700">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-200">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Resultado del Enrutamiento */}
                {routeResult && (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Resultado del Enrutamiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Métricas */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-900 p-4 rounded-lg text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Zap className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-slate-400">Modelo</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-600 text-white">
                                        {routeResult.selected_model}
                                    </Badge>
                                </div>
                                
                                <div className="bg-slate-900 p-4 rounded-lg text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-slate-400">Costo</span>
                                    </div>
                                    <p className="text-white font-bold">
                                        ${routeResult.cost.toFixed(4)}
                                    </p>
                                </div>
                                
                                <div className="bg-slate-900 p-4 rounded-lg text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm text-slate-400">Tiempo</span>
                                    </div>
                                    <p className="text-white font-bold">
                                        {routeResult.estimated_time.toFixed(1)}s
                                    </p>
                                </div>
                            </div>

                            {/* Respuesta */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">
                                    Respuesta del modelo
                                </label>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-600">
                                    <p className="text-white whitespace-pre-wrap">
                                        {routeResult.response}
                                    </p>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant={routeResult.success ? "default" : "destructive"}>
                                    {routeResult.success ? "Éxito" : "Error"}
                                </Badge>
                                <Badge variant="outline" className="text-purple-400 border-purple-400">
                                    {routeResult.task_type}
                                </Badge>
                                {routeResult.is_real_ai && (
                                    <Badge variant="outline" className="text-green-400 border-green-400">
                                        IA Real
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
