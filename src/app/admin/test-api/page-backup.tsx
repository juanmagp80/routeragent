"use client";

import { ApiKeyData, backendServiceDev } from "@/services/backendServiceDev";
import {
    AlertTriangle,
    CheckCircle,
    Code,
    Copy,
    ExternalLink,
    FileText,
    Key,
    Play,
    XCircle,
    Zap,
    DollarSign,
    Clock,
    Target,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TestRequest {
    prompt: string;
    task_type: string;
    priority: string;
}

interface TestResponse {
    success: boolean;
    error?: string;
    selected_model?: string;
    cost?: number;
    provider?: string;
    response?: string;
    processing_time?: number;
    total_usage?: number;
    plan_limit?: number;
    [key: string]: any;
}

export default function TestApiPage() {
    const [keys, setKeys] = useState<ApiKeyData[]>([]);
    const [selectedKeyId, setSelectedKeyId] = useState<string>("");
    const [apiKeyValue, setApiKeyValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [testRequest, setTestRequest] = useState<TestRequest>({
        prompt: "¿Cuál es la capital de Francia?",
        task_type: "general",
        priority: "cost"
    });
    const [testResponse, setTestResponse] = useState<TestResponse | null>(null);
    const [showResponse, setShowResponse] = useState(false);

    // Fetch API keys
    const fetchKeys = async () => {
        try {
            const response = await backendServiceDev.getApiKeys();
            setKeys(response.api_keys || []);
            if (response.api_keys && response.api_keys.length > 0) {
                setSelectedKeyId(response.api_keys[0].id);
            }
        } catch (error) {
            console.error('Error fetching API keys:', error);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    // Hacer request de prueba
    const handleTestRequest = async () => {
        if (!apiKeyValue.trim() || !testRequest.prompt.trim()) {
            console.error('Por favor ingresa la API key completa y escribe un prompt');
            return;
        }

        if (!apiKeyValue.startsWith('ar_')) {
            console.error('La API key debe comenzar con "ar_"');
            return;
        }

        setLoading(true);
        setTestResponse(null);
        setShowResponse(false);

        try {
            // Hacer request al endpoint de prueba
            const response = await fetch('http://localhost:3002/v1/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeyValue}`
                },
                body: JSON.stringify({
                    input: testRequest.prompt,
                    task_type: testRequest.task_type,
                    priority: testRequest.priority
                })
            });

            const data = await response.json();
            console.log('🟢 Respuesta backend:', data);
            setTestResponse(data);
            setShowResponse(true);

            // Actualizar la lista de keys para reflejar el nuevo uso
            await fetchKeys();

        } catch (error) {
            console.error('Error making test request:', error);
            setTestResponse({
                success: false,
                error: 'Error de conexión. Verifica que el backend esté ejecutándose.'
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
            priority: "quality",
            icon: "🔍"
        },
        {
            label: "Generación creativa",
            prompt: "Escribe un poema corto sobre la tecnología",
            task_type: "content_generation",
            priority: "quality",
            icon: "✨"
        },
        {
            label: "Traducción",
            prompt: "Traduce al inglés: 'Hola, ¿cómo estás?'",
            task_type: "translation",
            priority: "speed",
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

    const priorities = [
        { value: "cost", label: "Costo", desc: "Más económico", icon: DollarSign, color: "text-green-600" },
        { value: "speed", label: "Velocidad", desc: "Más rápido", icon: Zap, color: "text-yellow-600" },
        { value: "quality", label: "Calidad", desc: "Mejor resultado", icon: Target, color: "text-purple-600" }
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
                                    <h1 className="text-3xl font-bold">Prueba de API Keys</h1>
                                    <p className="text-purple-100 text-lg mt-1">Prueba y valida tus API keys directamente desde el dashboard</p>
                                </div>
                            </div>
                            <div className="flex items-center mt-6 space-x-4">
                                <div className="flex items-center bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                                    <Key className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">{keys.length} keys disponibles</span>
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
                            {/* Selección de API Key */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <Key className="h-4 w-4 mr-2 text-blue-600" />
                                    API Key de Referencia
                                </label>
                                <select
                                    value={selectedKeyId}
                                    onChange={(e) => setSelectedKeyId(e.target.value)}
                                    className="w-full border-2 border-blue-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                >
                                    <option value="">Selecciona una API Key</option>
                                    {keys.map((key) => (
                                        <option key={key.id} value={key.id}>
                                            {key.name} ({key.key_prefix}***) - {key.usage_count} usos
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-blue-600 font-medium">
                                    Solo para referencia. Ingresa la clave completa abajo.
                                </p>
                            </div>

                            {/* API Key completa */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                                    API Key Completa *
                                </label>
                                <input
                                    type="password"
                                    value={apiKeyValue}
                                    onChange={(e) => setApiKeyValue(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-mono"
                                    placeholder="ar_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Ingresa la API key completa para hacer la prueba
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

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Prioridad de Optimización
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {priorities.map((priority) => {
                                        const IconComponent = priority.icon;
                                        return (
                                            <label
                                                key={priority.value}
                                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                    testRequest.priority === priority.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value={priority.value}
                                                    checked={testRequest.priority === priority.value}
                                                    onChange={(e) => setTestRequest({ ...testRequest, priority: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`mr-3 ${priority.color}`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{priority.label}</div>
                                                    <div className="text-sm text-gray-600">{priority.desc}</div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Botón de prueba */}
                            <button
                                onClick={handleTestRequest}
                                disabled={loading || !apiKeyValue.trim() || !testRequest.prompt.trim()}
                                className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl text-base font-bold text-white shadow-lg transition-all duration-200 transform ${
                                    loading || !apiKeyValue.trim() || !testRequest.prompt.trim()
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300'
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
                                        Ejecutar Prueba
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
                                            <div className="grid grid-cols-2 gap-4">
                                                {testResponse.cost && (
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                        <div className="flex items-center">
                                                            <DollarSign className="h-4 w-4 text-emerald-600 mr-2" />
                                                            <div className="text-xs font-medium text-emerald-800">Costo</div>
                                                        </div>
                                                        <div className="text-lg font-bold text-emerald-900">
                                                            ${testResponse.cost.toFixed(4)}
                                                        </div>
                                                    </div>
                                                )}
                                                {testResponse.processing_time && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 text-blue-600 mr-2" />
                                                            <div className="text-xs font-medium text-blue-800">Tiempo</div>
                                                        </div>
                                                        <div className="text-lg font-bold text-blue-900">
                                                            {testResponse.processing_time}ms
                                                        </div>
                                                    </div>
                                                )}
                                                {testResponse.selected_model && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 col-span-2">
                                                        <div className="flex items-center">
                                                            <Target className="h-4 w-4 text-purple-600 mr-2" />
                                                            <div className="text-xs font-medium text-purple-800">Modelo</div>
                                                        </div>
                                                        <div className="text-sm font-bold text-purple-900">
                                                            {testResponse.selected_model}
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
                                    <li>Verás el costo real y tiempo de procesamiento</li>
                                    <li>Perfecto para validar tu integración antes de producción</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modelo de Negocio Detallado */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <DollarSign className="mr-3 h-6 w-6" />
                        Modelo de Negocio: Suscripción + Consumo
                    </h2>
                    <p className="text-emerald-100 mt-1">Cómo funciona la facturación y por qué es rentable</p>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Estructura Actual */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    📊 Estructura Actual de Planes
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-900">Starter</span>
                                            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold">$29/mes</span>
                                        </div>
                                        <p className="text-sm text-gray-600">1,000 requests incluidos</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-900">Pro</span>
                                            <span className="bg-emerald-500 text-white px-2 py-1 rounded text-sm font-bold">$49/mes</span>
                                        </div>
                                        <p className="text-sm text-gray-600">5,000 requests incluidos</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-900">Enterprise</span>
                                            <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm font-bold">$99/mes</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Requests ilimitados</p>
                                    </div>
                                </div>
                            </div>
                            

                        </div>

                        {/* Solución Recomendada */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    ✅ Modelo Óptimo: Cuota Fija por Requests
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border border-green-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-900">Pro Simplificado</span>
                                            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">$49/mes</span>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <p className="text-green-700">• <strong>5,000 requests incluidos</strong></p>
                                            <p className="text-green-700">• Costo promedio: <strong>$0.01 por request</strong></p>
                                            <p className="text-green-700">• Sin sorpresas, sin excesos</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-emerald-100 rounded-lg p-4">
                                        <h4 className="font-bold text-emerald-900 mb-2">💰 Comparativa de Valor:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-bold text-emerald-800 mb-1">🏢 Directo con OpenAI:</p>
                                                <ul className="space-y-1 text-emerald-700">
                                                    <li>• GPT-4o: ~$0.015/request</li>
                                                    <li>• Claude-3: ~$0.012/request</li>
                                                    <li>• Sin optimización automática</li>
                                                    <li><strong>5,000 requests = $60-75</strong></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-bold text-green-800 mb-1">🚀 Con AgentRouter:</p>
                                                <ul className="space-y-1 text-green-700">
                                                    <li>• Precio fijo: $0.01/request</li>
                                                    <li>• Optimización automática</li>
                                                    <li>• Ruteo inteligente</li>
                                                    <li><strong>5,000 requests = $49</strong> ✅</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mt-3 p-2 bg-green-200 rounded text-center">
                                            <strong className="text-green-900">Ahorro del cliente: $11-26/mes (18-35%)</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            

                        </div>
                    </div>
                    
                    {/* Matemáticas del Negocio */}
                    <div className="mt-8 bg-gray-900 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Target className="h-5 w-5 mr-2" />
                            � Matemáticas del Negocio
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-bold text-blue-400 mb-3">💰 Costos Reales (por request)</h4>
                                <div className="text-sm text-gray-300 space-y-2">
                                    <div className="flex justify-between">
                                        <span>GPT-4o:</span>
                                        <span className="text-blue-400">$0.0075</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Claude-3:</span>
                                        <span className="text-blue-400">$0.0060</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Llama-3:</span>
                                        <span className="text-blue-400">$0.0020</span>
                                    </div>
                                    <hr className="border-gray-600"/>
                                    <div className="flex justify-between font-bold">
                                        <span>Promedio optimizado:</span>
                                        <span className="text-green-400">$0.0070</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-bold text-green-400 mb-3">🎯 Precios de Venta</h4>
                                <div className="text-sm text-gray-300 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Starter (1K):</span>
                                        <span className="text-green-400">$0.029</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pro (5K):</span>
                                        <span className="text-green-400">$0.0098</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Enterprise:</span>
                                        <span className="text-green-400">$0.0080</span>
                                    </div>
                                    <hr className="border-gray-600"/>
                                    <div className="flex justify-between font-bold">
                                        <span>Margen promedio:</span>
                                        <span className="text-yellow-400">~40%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-bold text-purple-400 mb-3">📈 Proyección Mensual</h4>
                                <div className="text-sm text-gray-300 space-y-2">
                                    <div className="flex justify-between">
                                        <span>100 clientes Pro:</span>
                                        <span className="text-purple-400">$4,900</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Costos (70% uso):</span>
                                        <span className="text-red-400">-$2,450</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Infraestructura:</span>
                                        <span className="text-red-400">-$200</span>
                                    </div>
                                    <hr className="border-gray-600"/>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Ganancia neta:</span>
                                        <span className="text-emerald-400">$2,250</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 bg-gradient-to-r from-emerald-800 to-green-800 rounded-lg p-4">
                            <p className="text-emerald-100 font-bold text-center text-lg">
                                🚀 <strong>Modelo sustentable:</strong> Cliente ahorra 20-30% + Tú mantienes 40% de margen
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}