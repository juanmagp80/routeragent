"use client";

import {
    BarChart3,
    Brain,
    CheckCircle,
    Cpu,
    DollarSign,
    Key,
    Lightbulb,
    Play,
    Settings,
    Target,
    Timer,
    XCircle,
    Zap
} from "lucide-react";
import { useState } from "react";

interface AdvancedTestRequest {
    input: string;
    priority: 'cost' | 'balanced' | 'performance';
    max_tokens?: number;
}

interface AdvancedTestResponse {
    success: boolean;
    error?: string;
    selected_model?: string;
    cost?: number;
    estimated_time?: number;
    task_type?: string;
    response?: string;
    api_key_info?: {
        usage_count: number;
        usage_limit: number;
        plan: string;
    };
}

export default function AdvancedTestApiPage() {
    const [apiKeyValue, setApiKeyValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [testRequest, setTestRequest] = useState<AdvancedTestRequest>({
        input: "¿Cuál es la capital de Francia?",
        priority: "balanced"
    });
    const [testResponse, setTestResponse] = useState<AdvancedTestResponse | null>(null);
    const [showResponse, setShowResponse] = useState(false);
    const [selectedSuite, setSelectedSuite] = useState<string>("");
    const [suiteResults, setSuiteResults] = useState<any[]>([]);
    const [runningSuite, setRunningSuite] = useState(false);

    // Test suites para probar el algoritmo avanzado
    const testSuites = [
        {
            name: "Optimización de Costos",
            description: "Prueba cómo el algoritmo optimiza costos para diferentes tipos de tareas",
            tests: [
                {
                    name: "Pregunta Simple",
                    input: "¿Qué hora es?",
                    priority: "cost" as const
                },
                {
                    name: "Resumen Básico",
                    input: "Resume esta información en 2 líneas",
                    priority: "cost" as const
                }
            ]
        },
        {
            name: "Tareas Creativas",
            description: "Verifica que elige modelos adecuados para creatividad",
            tests: [
                {
                    name: "Historia Creativa",
                    input: "Escribe una historia original sobre un robot que sueña",
                    priority: "performance" as const
                },
                {
                    name: "Poesía",
                    input: "Crea un poema sobre el océano",
                    priority: "balanced" as const
                }
            ]
        },
        {
            name: "Distribución Inteligente",
            description: "Prueba la variabilidad y distribución inteligente del algoritmo",
            tests: [
                {
                    name: "Consulta General 1",
                    input: "¿Puedes ayudarme con información básica?",
                    priority: "balanced" as const
                },
                {
                    name: "Consulta General 2",
                    input: "Necesito asistencia con una pregunta",
                    priority: "balanced" as const
                },
                {
                    name: "Consulta General 3",
                    input: "Dame información sobre este tema",
                    priority: "balanced" as const
                }
            ]
        }
    ];

    // Hacer request de prueba individual
    const runTest = async () => {
        if (!testRequest.input.trim()) {
            alert("Por favor ingresa un prompt para probar");
            return;
        }

        if (!apiKeyValue.trim()) {
            alert("Por favor ingresa tu API Key");
            return;
        }

        setLoading(true);
        setShowResponse(false);

        try {
            const response = await fetch(`http://localhost:3002/v1/route`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeyValue}`
                },
                body: JSON.stringify({
                    input: testRequest.input,
                    priority: testRequest.priority,
                    max_tokens: testRequest.max_tokens || 1000
                })
            });

            const data = await response.json();
            setTestResponse(data);
            setShowResponse(true);
        } catch (error) {
            console.error('Error al probar API:', error);
            setTestResponse({
                success: false,
                error: `Error de conexión: ${error}`
            });
            setShowResponse(true);
        } finally {
            setLoading(false);
        }
    };

    // Ejecutar suite completa
    const runTestSuite = async (suite: any) => {
        if (!apiKeyValue.trim()) {
            alert("Por favor ingresa tu API Key");
            return;
        }

        setRunningSuite(true);
        setSuiteResults([]);
        setSelectedSuite(suite.name);

        const results = [];

        for (const test of suite.tests) {
            try {
                const response = await fetch(`http://localhost:3002/v1/route`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKeyValue}`
                    },
                    body: JSON.stringify({
                        input: test.input,
                        priority: test.priority,
                        max_tokens: 500
                    })
                });

                const data = await response.json();
                results.push({
                    ...test,
                    result: data,
                    success: data.success && data.selected_model
                });

                // Actualizar resultados en tiempo real
                setSuiteResults([...results]);

                // Pequeña pausa entre requests
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                results.push({
                    ...test,
                    result: { success: false, error: `Error: ${error}` },
                    success: false
                });
                setSuiteResults([...results]);
            }
        }

        setRunningSuite(false);
    };

    // Ejemplos rápidos
    const quickExamples = [
        {
            name: "Optimización Costo",
            input: "¿Cuál es la capital de España?",
            priority: "cost" as const
        },
        {
            name: "Tarea Creativa",
            input: "Escribe un cuento corto sobre robots",
            priority: "performance" as const
        },
        {
            name: "Análisis Complejo",
            input: "Analiza el impacto de la IA en el trabajo",
            priority: "performance" as const
        },
        {
            name: "Código Simple",
            input: "Función para sumar dos números en Python",
            priority: "balanced" as const
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                🧠 Algoritmo Avanzado - Test API
                            </h1>
                            <p className="text-gray-600">
                                Prueba el sistema de routing de modelos más inteligente del mundo
                            </p>
                        </div>
                    </div>

                    {/* Info del algoritmo */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Sistema Inteligente Activo</h3>
                                <p className="text-blue-700 text-sm">
                                    ✨ Análisis semántico profundo • 💰 Optimización de costos • 🎯 Selección contextual •
                                    🚀 Load balancing • 🧠 Aprendizaje automático • 4 proveedores (OpenAI, Anthropic, Google, xAI)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel de prueba individual */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Settings className="h-5 w-5 text-gray-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Prueba Individual</h2>
                            </div>

                            {/* API Key Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Key className="h-4 w-4 inline mr-1" />
                                    Tu API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKeyValue}
                                    onChange={(e) => setApiKeyValue(e.target.value)}
                                    placeholder="ar_xxxxxxxxxx..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Ejemplos rápidos */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Ejemplos Rápidos
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickExamples.map((example, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setTestRequest({
                                                input: example.input,
                                                priority: example.priority
                                            })}
                                            className="p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                        >
                                            <div className="font-medium text-gray-900">{example.name}</div>
                                            <div className="text-gray-600 text-xs mt-1 truncate">{example.input}</div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                {example.priority === 'cost' && '💰 Costo'}
                                                {example.priority === 'balanced' && '⚖️ Balanceado'}
                                                {example.priority === 'performance' && '🚀 Rendimiento'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input de prueba */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prompt de Prueba
                                </label>
                                <textarea
                                    value={testRequest.input}
                                    onChange={(e) => setTestRequest({ ...testRequest, input: e.target.value })}
                                    placeholder="Escribe tu prompt aquí para probar el algoritmo..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                                />
                            </div>

                            {/* Prioridad */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prioridad del Algoritmo
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'cost', label: '💰 Costo', desc: 'Optimiza precio' },
                                        { value: 'balanced', label: '⚖️ Balanceado', desc: 'Equilibrio ideal' },
                                        { value: 'performance', label: '🚀 Rendimiento', desc: 'Máxima calidad' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setTestRequest({ ...testRequest, priority: option.value as any })}
                                            className={`p-3 text-center border rounded-lg transition-all ${testRequest.priority === option.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-medium text-sm">{option.label}</div>
                                            <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Botón de prueba */}
                            <button
                                onClick={runTest}
                                disabled={loading || !testRequest.input.trim() || !apiKeyValue.trim()}
                                className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl text-base font-bold text-white shadow-lg transition-all duration-200 ${loading || !testRequest.input.trim() || !apiKeyValue.trim()
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Probando Algoritmo...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5 mr-2" />
                                        🧠 Probar Algoritmo Avanzado
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Resultados de prueba individual */}
                        {showResponse && testResponse && (
                            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-5 w-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Resultado del Algoritmo</h3>
                                </div>

                                {testResponse.success ? (
                                    <div className="space-y-4">
                                        {/* Métricas del algoritmo */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Cpu className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-900">Modelo</span>
                                                </div>
                                                <div className="text-lg font-bold text-blue-700 mt-1">
                                                    {testResponse.selected_model}
                                                </div>
                                            </div>

                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-900">Costo</span>
                                                </div>
                                                <div className="text-lg font-bold text-green-700 mt-1">
                                                    ${(testResponse.cost || 0).toFixed(4)}
                                                </div>
                                            </div>

                                            <div className="bg-orange-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Timer className="h-4 w-4 text-orange-600" />
                                                    <span className="text-sm font-medium text-orange-900">Tiempo</span>
                                                </div>
                                                <div className="text-lg font-bold text-orange-700 mt-1">
                                                    {testResponse.estimated_time || 0}ms
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-purple-600" />
                                                    <span className="text-sm font-medium text-purple-900">Tipo</span>
                                                </div>
                                                <div className="text-lg font-bold text-purple-700 mt-1">
                                                    {testResponse.task_type || 'general'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Respuesta */}
                                        {testResponse.response && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-2">Respuesta del Modelo:</h4>
                                                <p className="text-gray-700 text-sm">{testResponse.response}</p>
                                            </div>
                                        )}

                                        {/* Info de uso */}
                                        {testResponse.api_key_info && (
                                            <div className="text-sm text-gray-600">
                                                Uso: {testResponse.api_key_info.usage_count}/{testResponse.api_key_info.usage_limit}
                                                ({testResponse.api_key_info.plan})
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            <span className="font-medium text-red-900">Error</span>
                                        </div>
                                        <p className="text-red-700 mt-2">{testResponse.error}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Panel de suites de prueba */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="h-5 w-5 text-gray-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Suites de Prueba</h2>
                            </div>

                            <div className="space-y-3">
                                {testSuites.map((suite, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Zap className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-medium text-gray-900">{suite.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{suite.description}</p>
                                        <div className="text-xs text-gray-500 mb-3">
                                            {suite.tests.length} pruebas
                                        </div>
                                        <button
                                            onClick={() => runTestSuite(suite)}
                                            disabled={runningSuite || !apiKeyValue.trim()}
                                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${runningSuite || !apiKeyValue.trim()
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                        >
                                            {runningSuite && selectedSuite === suite.name ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2 inline-block"></div>
                                                    Ejecutando...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-3 w-3 mr-1 inline" />
                                                    Ejecutar Suite
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resultados de suite */}
                        {suiteResults.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-5 w-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Resultados: {selectedSuite}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {suiteResults.map((result, index) => (
                                        <div key={index} className={`p-3 rounded-lg border ${result.success
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-red-200 bg-red-50'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">
                                                    {result.name}
                                                </span>
                                                {result.success ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                            </div>

                                            {result.success && result.result?.selected_model && (
                                                <div className="text-xs text-gray-600">
                                                    <div>Modelo: <span className="font-medium">{result.result.selected_model}</span></div>
                                                    <div>Costo: ${(result.result.cost || 0).toFixed(4)}</div>
                                                    <div>Prioridad: {result.priority}</div>
                                                </div>
                                            )}

                                            {!result.success && (
                                                <div className="text-xs text-red-600">
                                                    Error: {result.result?.error || 'Unknown error'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Estadísticas de la suite */}
                                {suiteResults.length > 0 && !runningSuite && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {suiteResults.filter(r => r.success).length}
                                                </div>
                                                <div className="text-sm text-gray-600">Exitosas</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-600">
                                                    {suiteResults.filter(r => !r.success).length}
                                                </div>
                                                <div className="text-sm text-gray-600">Fallidas</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}