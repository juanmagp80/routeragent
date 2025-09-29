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
    XCircle
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
        task_type: "question_answering",
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
            const response = await fetch('http://localhost:3003/v1/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeyValue}`
                },
                body: JSON.stringify(testRequest)
            });

            const data = await response.json();
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
            priority: "cost"
        },
        {
            label: "Análisis de texto",
            prompt: "Analiza el sentimiento del siguiente texto: 'Me encanta este producto, es fantástico'",
            task_type: "analysis",
            priority: "quality"
        },
        {
            label: "Generación creativa",
            prompt: "Escribe un poema corto sobre la tecnología",
            task_type: "content_generation",
            priority: "quality"
        },
        {
            label: "Traducción",
            prompt: "Traduce al inglés: 'Hola, ¿cómo estás?'",
            task_type: "translation",
            priority: "speed"
        }
    ];

    const taskTypes = [
        { value: "question_answering", label: "Preguntas y Respuestas" },
        { value: "content_generation", label: "Generación de Contenido" },
        { value: "analysis", label: "Análisis" },
        { value: "translation", label: "Traducción" },
        { value: "coding", label: "Programación" },
        { value: "summarization", label: "Resumen" }
    ];

    const priorities = [
        { value: "cost", label: "Costo (Más económico)" },
        { value: "speed", label: "Velocidad (Más rápido)" },
        { value: "quality", label: "Calidad (Mejor resultado)" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prueba de API Keys</h1>
                    <p className="text-gray-600">Prueba tus API keys directamente desde el dashboard</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-gray-600">{keys.length} keys disponibles</span>
                    <Link
                        href="/admin/keys"
                        className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                    >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Gestionar keys
                    </Link>
                </div>
            </div>

            {/* Configuración de la prueba */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Prueba</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulario de prueba */}
                    <div className="space-y-4">
                        {/* Selección de API Key */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Key de Referencia
                            </label>
                            <select
                                value={selectedKeyId}
                                onChange={(e) => setSelectedKeyId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            >
                                <option value="">Selecciona una API Key</option>
                                {keys.map((key) => (
                                    <option key={key.id} value={key.id}>
                                        {key.name} ({key.key_prefix}***) - {key.usage_count} usos
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Solo para referencia. Ingresa la clave completa abajo.
                            </p>
                        </div>

                        {/* API Key completa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Key Completa *
                            </label>
                            <input
                                type="password"
                                value={apiKeyValue}
                                onChange={(e) => setApiKeyValue(e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="ar_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Ingresa la API key completa para hacer la prueba
                            </p>
                        </div>

                        {/* Prompt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prompt
                            </label>
                            <textarea
                                value={testRequest.prompt}
                                onChange={(e) => setTestRequest({ ...testRequest, prompt: e.target.value })}
                                rows={4}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Escribe tu prompt aquí..."
                            />
                        </div>

                        {/* Task Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Tarea
                            </label>
                            <select
                                value={testRequest.task_type}
                                onChange={(e) => setTestRequest({ ...testRequest, task_type: e.target.value })}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            >
                                {taskTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prioridad
                            </label>
                            <select
                                value={testRequest.priority}
                                onChange={(e) => setTestRequest({ ...testRequest, priority: e.target.value })}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            >
                                {priorities.map((priority) => (
                                    <option key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botón de prueba */}
                        <button
                            onClick={handleTestRequest}
                            disabled={loading || !apiKeyValue.trim() || !testRequest.prompt.trim()}
                            className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${loading || !apiKeyValue.trim() || !testRequest.prompt.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Probar API Key
                                </>
                            )}
                        </button>
                    </div>

                    {/* Ejemplos predefinidos */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Ejemplos Predefinidos</h3>
                        <div className="space-y-2">
                            {examplePrompts.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => setTestRequest({
                                        prompt: example.prompt,
                                        task_type: example.task_type,
                                        priority: example.priority
                                    })}
                                    className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <div className="font-medium text-sm text-gray-900">{example.label}</div>
                                    <div className="text-xs text-gray-500 mt-1 truncate">{example.prompt}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Respuesta */}
            {showResponse && testResponse && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Respuesta de la API</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={copyResponse}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Copy className="mr-1 h-4 w-4" />
                                Copiar
                            </button>
                            {testResponse.success ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    <span className="text-sm">Éxito</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <XCircle className="mr-1 h-4 w-4" />
                                    <span className="text-sm">Error</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información de la respuesta */}
                    {testResponse.success && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
                            <div className="text-center">
                                <div className="text-sm text-gray-600">Modelo Seleccionado</div>
                                <div className="font-semibold text-green-800">{testResponse.selected_model}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">Costo</div>
                                <div className="font-semibold text-green-800">${testResponse.cost?.toFixed(6)}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">Proveedor</div>
                                <div className="font-semibold text-green-800">{testResponse.provider}</div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!testResponse.success && testResponse.error && (
                        <div className="p-4 bg-red-50 rounded-lg mb-4">
                            <div className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                                <div className="text-red-800">
                                    <div className="font-medium">Error</div>
                                    <div className="text-sm">{testResponse.error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Uso actual */}
                    {(testResponse.total_usage !== undefined && testResponse.plan_limit !== undefined) && (
                        <div className="p-4 bg-blue-50 rounded-lg mb-4">
                            <div className="text-sm text-blue-600">
                                Uso actual: {testResponse.total_usage.toLocaleString()}/{testResponse.plan_limit.toLocaleString()} requests
                            </div>
                        </div>
                    )}

                    {/* JSON completo */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Code className="mr-1 h-4 w-4" />
                            Respuesta JSON Completa
                        </h3>
                        <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                            <code>{JSON.stringify(testResponse, null, 2)}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* Información adicional */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                    <div className="text-blue-800">
                        <div className="font-medium">¿Dónde encontrar tu API key completa?</div>
                        <div className="text-sm mt-1">
                            <p className="mb-2">
                                Por seguridad, solo almacenamos el hash de tus API keys. Para obtener la clave completa:
                            </p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Ve a la página "Claves API"</li>
                                <li>Crea una nueva API key - se mostrará la clave completa una sola vez</li>
                                <li>Copia y pega la clave aquí para hacer pruebas</li>
                                <li>Cada prueba cuenta como un uso real y se descontará de tu límite de requests</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}