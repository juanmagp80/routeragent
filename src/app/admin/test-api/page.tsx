"use client";

import {
    Brain,
    CheckCircle,
    Clock,
    Code,
    Copy,
    ExternalLink,
    FileText,
    Key,
    Play,
    Sparkles,
    Target,
    XCircle,
    Zap,
    BarChart3,
    Settings,
    Lightbulb,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

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
    [key: string]: any;
}

interface TestSuite {
    name: string;
    description: string;
    tests: {
        name: string;
        input: string;
        priority: 'cost' | 'balanced' | 'performance';
        expectedModel?: string[];
    }[];
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
            icon: DollarSign,
            tests: [
                {
                    name: "Pregunta Simple",
                    input: "¿Qué hora es?",
                    priority: "cost" as const,
                    expectedTypes: ["Gemini 1.5 Flash", "Claude 3 Haiku", "GPT-4o Mini"]
                },
                {
                    name: "Resumen Básico",
                    input: "Resume esta información en 2 líneas",
                    priority: "cost" as const,
                    expectedTypes: ["Claude 3 Haiku", "Gemini 1.5 Flash"]
                }
            ]
        },
        {
            name: "Tareas Creativas",
            description: "Verifica que elige modelos adecuados para creatividad",
            icon: Sparkles,
            tests: [
                {
                    name: "Historia Creativa",
                    input: "Escribe una historia original sobre un robot que sueña",
                    priority: "performance" as const,
                    expectedTypes: ["Claude 3.5 Sonnet", "GPT-4o"]
                },
                {
                    name: "Poesía",
                    input: "Crea un poema sobre el océano",
                    priority: "balanced" as const,
                    expectedTypes: ["Claude 3.5 Sonnet", "GPT-4o", "Gemini 1.5 Pro"]
                }
            ]
        },
        {
            name: "Distribución Inteligente",
            description: "Prueba la variabilidad y distribución inteligente del algoritmo",
            icon: TrendingUp,
            tests: [
                {
                    name: "Consulta General 1",
                    input: "¿Puedes ayudarme con información básica?",
                    priority: "balanced" as const,
                    expectedTypes: ["Variado"]
                },
                {
                    name: "Consulta General 2",
                    input: "Necesito asistencia con una pregunta",
                    priority: "balanced" as const,
                    expectedTypes: ["Variado"]
                },
                {
                    name: "Consulta General 3",
                    input: "Dame información sobre este tema",
                    priority: "balanced" as const,
                    expectedTypes: ["Variado"]
                }
            ]
        }
    ];

    // No necesitamos cargar API keys, el usuario las ingresará manualmente

    // Hacer request de prueba
    const handleTestRequest = async () => {
        if (!testRequest.prompt.trim()) {
            console.error('Por favor escribe un prompt para probar');
            return;
        }

        if (!apiKeyValue.trim()) {
            setTestResponse({
                success: false,
                error: 'Por favor ingresa tu API key para hacer la prueba'
            });
            setShowResponse(true);
            return;
        }

        setLoading(true);
        setTestResponse(null);
        setShowResponse(false);

        try {
            // Hacer request al endpoint real con autenticación, forzando GPT-4o
            const response = await fetch('http://localhost:3002/v1/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeyValue}`
                },
                body: JSON.stringify({
                    input: testRequest.prompt,
                    task_type: testRequest.task_type,
                    preferred_model: "GPT-4o"
                })
            });

            const data = await response.json();
            console.log('🟢 Respuesta backend:', data);
            setTestResponse(data);
            setShowResponse(true);

        } catch (error) {
            console.error('Error making test request:', error);
            setTestResponse({
                success: false,
                error: 'Error de conexión. Verifica que el backend esté ejecutándose en puerto 3002.'
            });
            setShowResponse(true);
        } finally {
            setLoading(false);
        }
    };

    // Copiar respuesta al portapapeles
    const copyResponse = () => {
        if (testResponse) {
            navigator.clipboard.writeText(JSON.stringify(testResponse, null, 2));
        }
    };

    // Ejemplos de prompts predefinidos
    const examplePrompts = [
        {
            label: "Pregunta simple",
            prompt: "¿Cuál es la capital de Francia?",
            task_type: "question_answering",
            priority: "cost",
            icon: "❓"
        },
        {
            label: "Análisis de texto",
            prompt: "Analiza el sentimiento del siguiente texto: 'Me encanta este producto, es fantástico'",
            task_type: "analysis",
            priority: "balanced",
            icon: "🔍"
        },
        {
            label: "Generación creativa",
            prompt: "Escribe un poema corto sobre la tecnología",
            task_type: "content_generation",
            priority: "performance",
            icon: "✨"
        },
        {
            label: "Traducción",
            prompt: "Traduce al inglés: 'Hola, ¿cómo estás?'",
            task_type: "translation",
            priority: "performance",
            icon: "🌐"
        }
    ];

    const taskTypes = [
        { value: "question_answering", label: "Preguntas y Respuestas", icon: "❓" },
        { value: "content_generation", label: "Generación de Contenido", icon: "✨" },
        { value: "analysis", label: "Análisis", icon: "🔍" },
        { value: "translation", label: "Traducción", icon: "🌐" },
        { value: "coding", label: "Programación", icon: "💻" },
        { value: "summarization", label: "Resumen", icon: "📄" }
    ];



    return (
        <div className="space-y-8">
            {/* Header mejorado */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-600 rounded-2xl p-8 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center mb-3">
                                <div className="bg-white/20 rounded-xl p-3 mr-4">
                                    <Play className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-display font-bold text-white">🧪 Prueba RouterAI</h1>
                                    <p className="text-purple-100 text-xl mt-2 font-medium">Prueba y valida tus API keys directamente desde el dashboard</p>
                                </div>
                            </div>
                            <div className="flex items-center mt-6 space-x-4">
                                <div className="flex items-center bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                                    <Key className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Usa tus API keys</span>
                                </div>
                                <div className="flex items-center bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Pruebas en tiempo real</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link
                                href="/admin/keys"
                                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 transform hover:scale-105"
                            >
                                <ExternalLink className="h-5 w-5 mr-2" />
                                Gestionar Keys
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ejemplos rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {examplePrompts.map((example, index) => (
                    <button
                        key={index}
                        onClick={() => setTestRequest({
                            prompt: example.prompt,
                            task_type: example.task_type,
                            priority: example.priority
                        })}
                        className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <div className="text-2xl mb-2">{example.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-2">{example.label}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{example.prompt}</p>
                    </button>
                ))}
            </div>

            {/* Configuración de la prueba */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Code className="mr-3 h-6 w-6 text-blue-600" />
                        Configuración de Prueba
                    </h2>
                    <p className="text-gray-600 mt-1">Configura los parámetros para probar tu API key</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Formulario de prueba */}
                        <div className="space-y-6">
                            {/* Ingreso de API Key */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <Key className="h-4 w-4 mr-2 text-blue-600" />
                                    Tu API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKeyValue}
                                    onChange={(e) => setApiKeyValue(e.target.value)}
                                    placeholder="ar_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    className="w-full border-2 border-blue-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white font-mono"
                                />
                                <p className="mt-2 text-xs text-blue-600 font-medium">
                                    Ingresa tu API key completa para hacer pruebas reales. Ve a "Claves API" para gestionar tus keys.
                                </p>
                            </div>

                            {/* Información de modo prueba */}
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center mb-2">
                                    <Zap className="h-4 w-4 mr-2 text-green-600" />
                                    <span className="text-sm font-bold text-green-900">Pruebas Reales</span>
                                </div>
                                <p className="text-xs text-green-700">
                                    Esta página usa el endpoint real de producción. Los requests consumirán tu cuota de API usando siempre GPT-4o.
                                </p>
                            </div>

                            {/* Prompt */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Prompt
                                </label>
                                <textarea
                                    value={testRequest.prompt}
                                    onChange={(e) => setTestRequest({ ...testRequest, prompt: e.target.value })}
                                    rows={4}
                                    className="w-full border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm resize-none"
                                    placeholder="Escribe tu prompt aquí..."
                                />
                            </div>

                            {/* Task Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Tipo de Tarea
                                </label>
                                <select
                                    value={testRequest.task_type}
                                    onChange={(e) => setTestRequest({ ...testRequest, task_type: e.target.value })}
                                    className="w-full border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                >
                                    {taskTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>



                            {/* Botón de prueba */}
                            <button
                                onClick={handleTestRequest}
                                disabled={loading || !testRequest.prompt.trim()}
                                className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl text-base font-bold text-white shadow-lg transition-all duration-200 transform ${loading || !testRequest.prompt.trim()
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5 mr-3" />
                                        Probar Router IA
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Panel de respuesta */}
                        <div className="space-y-6">
                            {/* Estado de la prueba */}
                            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                                    Estado de la Prueba
                                </h3>
                                {!showResponse ? (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">🚀</div>
                                        <p className="text-gray-600">Configura y ejecuta una prueba para ver los resultados</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {testResponse?.success ? (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                                    <div className="text-sm font-medium text-green-800">
                                                        ✅ Prueba exitosa
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                                <div className="flex items-center">
                                                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                                                    <div className="text-sm font-medium text-red-800">
                                                        ❌ Error en la prueba
                                                    </div>
                                                </div>
                                                {testResponse?.error && (
                                                    <div className="mt-2 text-sm text-red-700">
                                                        {testResponse.error}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Métricas */}
                                        {testResponse?.success && (
                                            <div className="grid grid-cols-1 gap-4">
                                                {testResponse.selected_model && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div className="flex items-center">
                                                            <Target className="h-4 w-4 text-purple-600 mr-2" />
                                                            <div className="text-xs font-medium text-purple-800">Modelo Usado</div>
                                                        </div>
                                                        <div className="text-sm font-bold text-purple-900">
                                                            {testResponse.selected_model}
                                                        </div>
                                                    </div>
                                                )}
                                                {testResponse.processing_time && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 text-blue-600 mr-2" />
                                                            <div className="text-xs font-medium text-blue-800">Tiempo de Respuesta</div>
                                                        </div>
                                                        <div className="text-lg font-bold text-blue-900">
                                                            {testResponse.processing_time}ms
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Respuesta del modelo */}
                                        {testResponse?.response && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-900">Respuesta del Modelo</h4>
                                                    <button
                                                        onClick={copyResponse}
                                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="bg-white border rounded-lg p-3 text-sm text-gray-800 max-h-40 overflow-y-auto">
                                                    {testResponse.response}
                                                </div>
                                            </div>
                                        )}

                                        {/* Respuesta técnica completa */}
                                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-white">Respuesta Completa (JSON)</h4>
                                                <button
                                                    onClick={copyResponse}
                                                    className="text-gray-300 hover:text-white transition-colors"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <pre className="text-green-400 text-xs overflow-x-auto max-h-48 overflow-y-auto font-mono">
                                                {JSON.stringify(testResponse, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información importante */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start">
                    <FileText className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-800">
                        <div className="font-bold text-lg mb-2">� Información importante sobre API keys</div>
                        <div className="space-y-3">
                            <p className="font-semibold">
                                **Seguridad**: Solo almacenamos el hash de tus API keys. Para obtener la clave completa:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 ml-4">
                                <li>Ve a la página "Claves API"</li>
                                <li>Crea una nueva API key - se mostrará la clave completa una sola vez</li>
                                <li>Copia y pega la clave aquí para hacer pruebas</li>
                                <li>**Cada prueba cuenta como un uso real** y se descontará de tu límite de requests</li>
                            </ol>

                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 mt-4">
                                <p className="font-bold text-emerald-800 mb-2">⚡ **Pruebas en Tiempo Real:**</p>
                                <ul className="list-disc list-inside space-y-1 text-emerald-700 text-sm">
                                    <li>Cada prueba usa tu cuota mensual de requests</li>
                                    <li>Verás el modelo usado y tiempo de procesamiento</li>
                                    <li>Perfecto para validar tu integración antes de producción</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}