"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface TestCall {
    id: string;
    timestamp: string;
    status: 'loading' | 'success' | 'error';
    response?: any;
    error?: string;
    duration?: number;
}

export default function TestActivityGenerator() {
    const { user } = useAuth();
    const [apiKey, setApiKey] = useState('');
    const [testCalls, setTestCalls] = useState<TestCall[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const samplePrompts = [
        {
            input: "Explica brevemente qué es la inteligencia artificial",
            task_type: "general",
            priority: "cost"
        },
        {
            input: "Traduce al inglés: 'Hola, ¿cómo estás?'",
            task_type: "translation",
            priority: "speed"
        },
        {
            input: "Genera una función JavaScript para calcular números primos",
            task_type: "code-generation",
            priority: "quality"
        },
        {
            input: "Resume este texto en 2 líneas: La programación es el arte de crear instrucciones para computadoras...",
            task_type: "summarization",
            priority: "cost"
        },
        {
            input: "Analiza las ventajas y desventajas del trabajo remoto",
            task_type: "analysis",
            priority: "quality"
        }
    ];

    const generateTestActivity = async () => {
        // Validar y limpiar la API key
        const cleanApiKey = apiKey.trim().replace(/[^\x00-\x7F]/g, ''); // Remover caracteres no ASCII

        if (!cleanApiKey) {
            alert('Por favor ingresa una API key válida');
            return;
        }

        console.log('🔑 API Key limpia:', cleanApiKey.substring(0, 8) + '***');
        setIsGenerating(true);

        for (let i = 0; i < 5; i++) {
            const testCall: TestCall = {
                id: `test-${Date.now()}-${i}`,
                timestamp: new Date().toISOString(),
                status: 'loading'
            };

            setTestCalls(prev => [...prev, testCall]);

            try {
                const startTime = Date.now();
                const promptData = samplePrompts[i % samplePrompts.length];

                console.log(`📤 Enviando llamada ${i + 1}:`, {
                    url: '/api/v1/route',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': cleanApiKey.substring(0, 8) + '***'
                    },
                    body: promptData
                });

                const response = await fetch('/api/v1/route', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': cleanApiKey
                    },
                    body: JSON.stringify(promptData)
                });

                const duration = Date.now() - startTime;
                const data = await response.json();

                setTestCalls(prev =>
                    prev.map(call =>
                        call.id === testCall.id
                            ? {
                                ...call,
                                status: response.ok ? 'success' : 'error',
                                response: data,
                                duration,
                                error: response.ok ? undefined : data.error || 'Error desconocido'
                            }
                            : call
                    )
                );

                // Esperar un poco entre llamadas para simular uso real
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                const duration = Date.now() - Date.parse(testCall.timestamp);
                setTestCalls(prev =>
                    prev.map(call =>
                        call.id === testCall.id
                            ? {
                                ...call,
                                status: 'error',
                                duration,
                                error: error instanceof Error ? error.message : 'Error de conexión'
                            }
                            : call
                    )
                );
            }
        }

        setIsGenerating(false);
    };

    const clearTestCalls = () => {
        setTestCalls([]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    🧪 Generador de Actividad de Prueba
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key del Usuario
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Ingresa tu API key para generar actividad real..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Esta API key se usará para hacer llamadas reales y generar datos de actividad
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={generateTestActivity}
                            disabled={isGenerating || !apiKey.trim()}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isGenerating ? '🔄 Generando actividad...' : '🚀 Generar 5 llamadas de prueba'}
                        </button>

                        <button
                            onClick={clearTestCalls}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            🗑️ Limpiar resultados
                        </button>
                    </div>
                </div>
            </div>

            {testCalls.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        📊 Resultados de las Pruebas ({testCalls.length})
                    </h2>

                    <div className="space-y-3">
                        {testCalls.map((call) => (
                            <div
                                key={call.id}
                                className={`p-4 rounded-lg border-l-4 ${call.status === 'loading'
                                        ? 'border-l-blue-500 bg-blue-50'
                                        : call.status === 'success'
                                            ? 'border-l-green-500 bg-green-50'
                                            : 'border-l-red-500 bg-red-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {call.status === 'loading' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                                        {call.status === 'success' && <span className="text-green-600">✅</span>}
                                        {call.status === 'error' && <span className="text-red-600">❌</span>}

                                        <span className="font-medium">
                                            {call.status === 'loading' ? 'Procesando...' :
                                                call.status === 'success' ? 'Completado' : 'Error'}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {call.duration ? `${call.duration}ms` : ''}
                                        {' • '}
                                        {new Date(call.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>

                                {call.error && (
                                    <div className="mt-2 text-sm text-red-600">
                                        Error: {call.error}
                                    </div>
                                )}

                                {call.response && call.status === 'success' && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <div>Modelo: {call.response.selected_model}</div>
                                        <div>Costo: ${call.response.cost?.toFixed(4)}</div>
                                        <div>Proveedor: {call.response.provider}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {testCalls.filter(c => c.status !== 'loading').length === testCalls.length && testCalls.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">📈 Resumen</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Éxito:</span>
                                    <span className="ml-1 font-medium text-green-600">
                                        {testCalls.filter(c => c.status === 'success').length}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Errores:</span>
                                    <span className="ml-1 font-medium text-red-600">
                                        {testCalls.filter(c => c.status === 'error').length}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Tiempo promedio:</span>
                                    <span className="ml-1 font-medium">
                                        {Math.round(testCalls.filter(c => c.duration).reduce((acc, c) => acc + (c.duration || 0), 0) / testCalls.filter(c => c.duration).length)}ms
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Costo total:</span>
                                    <span className="ml-1 font-medium">
                                        ${testCalls.filter(c => c.response?.cost).reduce((acc, c) => acc + (c.response?.cost || 0), 0).toFixed(4)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                💡 Ve al dashboard principal para ver cómo aparecen estos datos en la actividad reciente
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}