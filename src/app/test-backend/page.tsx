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
                    quality_target: 'medium',
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        🧪 Test Backend RouterAI
                    </h1>
                    <p className="text-gray-600">
                        Verifica la conectividad y funcionalidad del router de modelos de IA
                    </p>
                </div>

                {/* Estado de conexión */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Server className="h-5 w-5" />
                            <span>Estado del Backend</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {isConnected === null ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                ) : isConnected ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="font-medium">
                                    {isConnected === null ? 'Verificando...' : 
                                     isConnected ? 'Conectado' : 'Desconectado'}
                                </span>
                            </div>
                            <Button 
                                onClick={checkBackendConnection} 
                                variant="outline" 
                                size="sm"
                            >
                                Reconectar
                            </Button>
                        </div>

                        {systemInfo && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-2">Información del Sistema:</h4>
                                <pre className="text-sm text-gray-600">
                                    {JSON.stringify(systemInfo, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Error global */}
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-700">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Test de routing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle>🎯 Configuración de Prueba</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Texto de entrada:
                                </label>
                                <Textarea
                                    value={testInput}
                                    onChange={(e) => setTestInput(e.target.value)}
                                    placeholder="Escribe aquí el texto que quieres procesar..."
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tipo de tarea:
                                </label>
                                <select
                                    value={taskType}
                                    onChange={(e) => setTaskType(e.target.value as RouteRequest['task_type'])}
                                    className="w-full p-2 border border-gray-300 rounded-md"
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
                                disabled={!isConnected || isRouting || !testInput.trim()}
                                className="w-full"
                            >
                                {isRouting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    '🚀 Probar Router'
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Resultado */}
                    <Card>
                        <CardHeader>
                            <CardTitle>📊 Resultado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isRouting && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            )}

                            {routeResult && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="font-medium text-green-700">
                                            Procesado exitosamente
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Modelo:</span>
                                            <Badge variant="outline">
                                                {routeResult.selected_model}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Costo:</span>
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="font-mono text-sm">
                                                    ${routeResult.cost.toFixed(6)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Tiempo:</span>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm">
                                                    {routeResult.estimated_time}ms
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">IA Real:</span>
                                            <div className="flex items-center space-x-1">
                                                <Zap className="h-4 w-4 text-yellow-600" />
                                                <span className="text-sm">
                                                    {routeResult.is_real_ai ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium mb-2">Respuesta:</h4>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {routeResult.response}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!isRouting && !routeResult && (
                                <div className="text-center py-8 text-gray-500">
                                    <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Ejecuta una prueba para ver los resultados</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
