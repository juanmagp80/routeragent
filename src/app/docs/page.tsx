"use client";

import {
    CheckCircle,
    Code,
    Copy,
    Play,
    Shield,
    Terminal,
    Zap
} from "lucide-react";
import { useState } from "react";

const DocsPage = () => {
    const [activeTab, setActiveTab] = useState("quickstart");
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [playgroundInput, setPlaygroundInput] = useState("Explica qué es la inteligencia artificial en términos simples");
    const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
    const [playgroundLoading, setPlaygroundLoading] = useState(false);

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const runPlayground = async () => {
        setPlaygroundLoading(true);
        try {
            const response = await fetch('/api/v1/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a'
                },
                body: JSON.stringify({
                    input: playgroundInput,
                    task_type: "general"
                })
            });

            const data = await response.json();
            setPlaygroundResponse(data);
        } catch (error) {
            setPlaygroundResponse({ error: "Failed to connect to API" });
        }
        setPlaygroundLoading(false);
    };

    const tabs = [
        { id: "quickstart", label: "Inicio Rápido", icon: Zap },
        { id: "authentication", label: "Autenticación", icon: Shield },
        { id: "endpoints", label: "Endpoints", icon: Terminal },
        { id: "examples", label: "Ejemplos", icon: Code },
        { id: "playground", label: "Pruebas", icon: Play }
    ];

    const codeExamples = {
        curl: `curl -X POST http://localhost:3000/api/v1/route \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a" \\
  -d '{
    "input": "Traduce Hello World al español",
    "task_type": "translation"
  }'`,

        javascript: `const response = await fetch('http://localhost:3000/api/v1/route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a'
  },
  body: JSON.stringify({
    input: '¿Cuál es la capital de Francia?',
    task_type: 'question'
  })
});

const data = await response.json();
console.log('Modelo usado:', data.selected_model);
console.log('Respuesta:', data.response);`,

        python: `import requests

response = requests.post(
    'http://localhost:3000/api/v1/route',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a'
    },
    json={
        'input': 'Analiza los beneficios de usar RouterAI',
        'task_type': 'analysis'
    }
)

data = response.json()
print(f"Modelo usado: {data['selected_model']}")
print(f"Respuesta: {data['response']}")`,

        node: `const fetch = require('node-fetch');

const response = await fetch('http://localhost:3000/api/v1/route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a'
  },
  body: JSON.stringify({
    input: 'Escribe un resumen de los beneficios de la IA',
    task_type: 'summary'
  })
});

const data = await response.json();
console.log('Modelo usado:', data.selected_model);
console.log('Costo:', data.cost);
console.log('Respuesta:', data.response);`
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-black mb-4">
                            RouterAI <span className="text-emerald-400">API Docs</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                            Documentación completa para integrar el router inteligente de IA en tu aplicación.
                            Optimiza costos automáticamente con una sola línea de código.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                                                ? "bg-emerald-500 text-white shadow-lg"
                                                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5 mr-3" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === "quickstart" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">🚀 Inicio Rápido</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Empieza a usar RouterAI en menos de 5 minutos. Optimización automática de IA sin complicaciones.
                                    </p>
                                </div>

                                {/* Step 1 */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                                            1
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Obtén tu API Key</h3>
                                    </div>
                                    <p className="text-slate-600 mb-4">
                                        Para este demo, usa la siguiente API key de prueba:
                                    </p>
                                    <div className="bg-slate-900 rounded-lg p-4 relative">
                                        <button
                                            onClick={() => copyToClipboard('ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a', 'step1')}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                                        >
                                            {copiedCode === 'step1' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                        <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                                            ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a
                                        </pre>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                                            2
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Haz tu primera petición</h3>
                                    </div>
                                    <p className="text-slate-600 mb-4">
                                        Prueba el endpoint principal con este ejemplo:
                                    </p>
                                    <div className="bg-slate-900 rounded-lg p-4 relative">
                                        <button
                                            onClick={() => copyToClipboard(codeExamples.curl, 'step2')}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                                        >
                                            {copiedCode === 'step2' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                        <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                                            {codeExamples.curl}
                                        </pre>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                                            3
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">¡Empieza a ahorrar!</h3>
                                    </div>
                                    <p className="text-slate-600 mb-4">
                                        El router seleccionará automáticamente el modelo más eficiente para cada tarea.
                                    </p>
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                                            <span className="text-emerald-800 font-bold text-lg">
                                                Ahorro promedio: 70-95% en costos de IA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "authentication" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">🔐 Autenticación</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        RouterAI usa API Keys para autenticación. Todas las peticiones requieren un token Bearer.
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Formato de API Key</h3>
                                    <p className="text-slate-600 mb-4">
                                        Todas las API keys tienen el formato <code className="bg-slate-100 px-2 py-1 rounded">ar_xxxxxxxx...</code> (RouterAI API Key)
                                    </p>
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <code className="text-emerald-400 font-mono text-sm">
                                            Authorization: Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a
                                        </code>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">🔑 API Key para Testing</h3>
                                    <p className="text-slate-600 mb-4">
                                        Usa esta API key de demostración para probar los endpoints:
                                    </p>
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <code className="text-sm font-mono text-emerald-800">ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a</code>
                                            <button
                                                onClick={() => copyToClipboard('ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a', 'demo-key')}
                                                className="text-emerald-600 hover:text-emerald-800"
                                            >
                                                {copiedCode === 'demo-key' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-900 mb-2">🌐 Base URL</h4>
                                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                        <code className="text-slate-800">http://localhost:3000/api</code>
                                    </div>

                                    <h4 className="font-bold text-slate-900 mb-2">📝 Ejemplo de petición completa</h4>
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <pre className="text-emerald-400 font-mono text-sm">
{`curl -X POST http://localhost:3000/api/v1/route \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a" \\
  -d '{
    "input": "Tu pregunta aquí",
    "task_type": "general"
  }'`}
                                        </pre>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <Shield className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-yellow-800">Entorno de desarrollo</h4>
                                            <p className="text-yellow-700 text-sm">
                                                Esta documentación está configurada para el entorno local de desarrollo (localhost:3000). 
                                                En producción, usa la URL correspondiente a tu despliegue.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "endpoints" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">🛠️ API Endpoints</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Referencia completa de todos los endpoints disponibles.
                                    </p>
                                </div>

                                {/* Route Endpoint */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold mr-4">
                                            POST
                                        </span>
                                        <code className="text-lg font-mono">/v1/route</code>
                                    </div>
                                    <p className="text-slate-600 mb-4">
                                        Endpoint principal para rutear tareas al modelo de IA óptimo.
                                    </p>

                                    <h4 className="font-bold text-slate-900 mb-2">Request Body:</h4>
                                    <div className="bg-slate-900 rounded-lg p-4 mb-4">
                                        <pre className="text-emerald-400 font-mono text-sm">
{`{
  "input": "string (required) - Tu pregunta o texto a procesar",
  "task_type": "summary|translation|analysis|question|coding|general (opcional)"
}`}
                                        </pre>
                                    </div>

                                    <h4 className="font-bold text-slate-900 mb-2">Tipos de tarea disponibles:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                            <code className="text-emerald-800 font-bold">"summary"</code>
                                            <p className="text-sm text-slate-600 mt-1">→ GPT-4o Mini (rápido y económico)</p>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <code className="text-blue-800 font-bold">"translation"</code>
                                            <p className="text-sm text-slate-600 mt-1">→ Claude-3 (alta calidad)</p>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                            <code className="text-purple-800 font-bold">"analysis"</code>
                                            <p className="text-sm text-slate-600 mt-1">→ Claude-3 (razonamiento profundo)</p>
                                        </div>
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <code className="text-orange-800 font-bold">"question"</code>
                                            <p className="text-sm text-slate-600 mt-1">→ Gemini-Pro (balance perfecto)</p>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <code className="text-green-800 font-bold">"coding"</code>
                                            <p className="text-sm text-slate-600 mt-1">→ GPT-4o (máxima calidad)</p>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                            <code className="text-slate-800 font-bold">"general"</code>
                                            <p className="text-sm text-slate-600 mt-1">→ Selección aleatoria</p>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-900 mb-2">Response:</h4>
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <pre className="text-blue-400 font-mono text-sm">
{`{
  "selected_model": "Claude-3",
  "cost": 0.002,
  "estimated_time": 125,
  "response": "Traducción al español: 'Hola Mundo'. Esta es una...",
  "task_type": "translation",
  "success": true
}`}
                                        </pre>
                                    </div>

                                    <h4 className="font-bold text-slate-900 mb-2 mt-6">Campos de respuesta:</h4>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <ul className="space-y-2 text-sm">
                                            <li><code className="bg-slate-200 px-2 py-1 rounded text-xs">selected_model</code> - Modelo seleccionado para la tarea</li>
                                            <li><code className="bg-slate-200 px-2 py-1 rounded text-xs">cost</code> - Costo estimado en USD</li>
                                            <li><code className="bg-slate-200 px-2 py-1 rounded text-xs">estimated_time</code> - Tiempo de procesamiento en ms</li>
                                            <li><code className="bg-slate-200 px-2 py-1 rounded text-xs">response</code> - Respuesta generada por la IA</li>
                                            <li><code className="bg-slate-200 px-2 py-1 rounded text-xs">task_type</code> - Tipo de tarea detectado/especificado</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Ejemplos Prácticos por Tipo de Tarea */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">📚 Ejemplos Prácticos por Tipo de Tarea</h3>
                                    <p className="text-slate-600 mb-6">
                                        Descubre cómo cada tipo de tarea selecciona automáticamente el modelo más eficiente.
                                    </p>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Ejemplo Summary */}
                                        <div className="border border-emerald-200 rounded-lg p-4">
                                            <div className="flex items-center mb-3">
                                                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">summary</span>
                                                <span className="text-sm text-slate-500 ml-2">→ GPT-4o Mini</span>
                                            </div>
                                            <h4 className="font-bold mb-2">Resumir contenido</h4>
                                            <div className="bg-slate-900 rounded p-3 text-xs">
                                                <div className="text-emerald-400 mb-2"># Entrada</div>
                                                <div className="text-slate-300 mb-3">{"{"}"input": "Resume los beneficios de la energía solar: [texto largo...]", "task_type": "summary"{"}"}</div>
                                                <div className="text-blue-400 mb-2"># Respuesta</div>
                                                <div className="text-slate-300">{"{"}"selected_model": "GPT-4o Mini", "cost": 0.001, "response": "**Beneficios principales:** 1. Renovable y limpia..."{"}"}</div>
                                            </div>
                                        </div>

                                        {/* Ejemplo Translation */}
                                        <div className="border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center mb-3">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">translation</span>
                                                <span className="text-sm text-slate-500 ml-2">→ Claude-3</span>
                                            </div>
                                            <h4 className="font-bold mb-2">Traducir texto</h4>
                                            <div className="bg-slate-900 rounded p-3 text-xs">
                                                <div className="text-emerald-400 mb-2"># Entrada</div>
                                                <div className="text-slate-300 mb-3">{"{"}"input": "Translate 'Good morning' to Spanish", "task_type": "translation"{"}"}</div>
                                                <div className="text-blue-400 mb-2"># Respuesta</div>
                                                <div className="text-slate-300">{"{"}"selected_model": "Claude-3", "cost": 0.002, "response": "Traducción: 'Buenos días'..."{"}"}</div>
                                            </div>
                                        </div>

                                        {/* Ejemplo Analysis */}
                                        <div className="border border-purple-200 rounded-lg p-4">
                                            <div className="flex items-center mb-3">
                                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">analysis</span>
                                                <span className="text-sm text-slate-500 ml-2">→ Claude-3</span>
                                            </div>
                                            <h4 className="font-bold mb-2">Análisis profundo</h4>
                                            <div className="bg-slate-900 rounded p-3 text-xs">
                                                <div className="text-emerald-400 mb-2"># Entrada</div>
                                                <div className="text-slate-300 mb-3">{"{"}"input": "Analiza las ventajas de RouterAI vs OpenAI directo", "task_type": "analysis"{"}"}</div>
                                                <div className="text-blue-400 mb-2"># Respuesta</div>
                                                <div className="text-slate-300">{"{"}"selected_model": "Claude-3", "cost": 0.003, "response": "**Análisis comparativo:** RouterAI optimiza automáticamente..."{"}"}</div>
                                            </div>
                                        </div>

                                        {/* Ejemplo Question */}
                                        <div className="border border-orange-200 rounded-lg p-4">
                                            <div className="flex items-center mb-3">
                                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">question</span>
                                                <span className="text-sm text-slate-500 ml-2">→ Gemini-Pro</span>
                                            </div>
                                            <h4 className="font-bold mb-2">Preguntas directas</h4>
                                            <div className="bg-slate-900 rounded p-3 text-xs">
                                                <div className="text-emerald-400 mb-2"># Entrada</div>
                                                <div className="text-slate-300 mb-3">{"{"}"input": "¿Cuál es la capital de Francia?", "task_type": "question"{"}"}</div>
                                                <div className="text-blue-400 mb-2"># Respuesta</div>
                                                <div className="text-slate-300">{"{"}"selected_model": "Gemini-Pro", "cost": 0.001, "response": "La capital de Francia es París..."{"}"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
                                        <h4 className="font-bold text-emerald-800 mb-2">💡 Tip de optimización</h4>
                                        <p className="text-emerald-700 text-sm">
                                            Si no especificas <code className="bg-emerald-100 px-2 py-1 rounded">task_type</code>, RouterAI lo detectará automáticamente basándose en el contenido. 
                                            ¡Pero especificarlo garantiza la máxima precisión en la selección del modelo!
                                        </p>
                                    </div>
                                </div>

                                {/* Metrics Endpoint */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mr-4">
                                            GET
                                        </span>
                                        <code className="text-lg font-mono">/v1/metrics</code>
                                    </div>
                                    <p className="text-slate-600 mb-4">
                                        Obtener métricas de uso y estadísticas de tu cuenta.
                                    </p>

                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <pre className="text-blue-400 font-mono text-sm">
{`{
  "metrics": [
    {
      "model": "claude-3.5-sonnet",
      "count": 45,
      "sum": 0.675
    },
    {
      "model": "gpt-4o-mini", 
      "count": 89,
      "sum": 0.134
    }
  ],
  "summary": {
    "total_cost": 1.588,
    "total_requests": 224,
    "avg_cost_per_request": 0.007,
    "savings_vs_gpt4": "87%"
  },
  "success": true
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "examples" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">💻 Ejemplos de Código</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Ejemplos listos para usar en diferentes lenguajes de programación.
                                    </p>
                                </div>

                                {/* Code Examples */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="border-b border-slate-200">
                                        <div className="flex space-x-0">
                                            {Object.keys(codeExamples).map((lang) => (
                                                <button
                                                    key={lang}
                                                    className="px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all border-r border-slate-200 last:border-r-0"
                                                >
                                                    {lang.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="bg-slate-900 rounded-lg p-4 relative">
                                            <button
                                                onClick={() => copyToClipboard(codeExamples.javascript, 'js-example')}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-white"
                                            >
                                                {copiedCode === 'js-example' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                            <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                                                {codeExamples.javascript}
                                            </pre>
                                        </div>
                                    </div>
                                </div>

                                {/* Use Cases */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        {
                                            title: "Chatbot Inteligente",
                                            description: "Router automático para respuestas de soporte",
                                            savings: "85% ahorro",
                                            taskType: "general"
                                        },
                                        {
                                            title: "Traductor Multiidioma",
                                            description: "Traducciones de alta calidad optimizadas",
                                            savings: "70% ahorro",
                                            taskType: "translation"
                                        },
                                        {
                                            title: "Analizador de Contenido",
                                            description: "Análisis profundo de documentos",
                                            savings: "80% ahorro",
                                            taskType: "analysis"
                                        },
                                        {
                                            title: "Asistente de Código",
                                            description: "Generación y revisión de código",
                                            savings: "90% ahorro",
                                            taskType: "coding"
                                        }
                                    ].map((useCase, index) => (
                                        <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-bold text-slate-900">{useCase.title}</h3>
                                                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                                                    {useCase.savings}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-sm mb-4">{useCase.description}</p>
                                            <div className="bg-slate-900 rounded-lg p-3">
                                                <code className="text-emerald-400 text-xs">
{`fetch('/api/v1/route', {
  method: 'POST',
  body: JSON.stringify({
    input: "Tu consulta aquí",
    task_type: "${useCase.taskType}"
  })
})`}
                                                </code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "playground" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">🎮 Playground - Prueba la API</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Prueba RouterAI directamente desde aquí. Envía consultas y ve cómo el router selecciona automáticamente el mejor modelo.
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Entrada</h3>
                                    <div className="mb-4">
                                        <textarea
                                            className="w-full p-4 border border-slate-200 rounded-lg resize-none text-slate-900 placeholder:text-slate-500"
                                            rows={4}
                                            placeholder="Escribe tu pregunta o tarea aquí..."
                                            value={playgroundInput}
                                            onChange={(e) => setPlaygroundInput(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={runPlayground}
                                            disabled={playgroundLoading}
                                            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-600 disabled:bg-slate-300 transition-all"
                                        >
                                            {playgroundLoading ? "Procesando..." : "🚀 Enviar"}
                                        </button>
                                    </div>
                                </div>

                                {playgroundResponse && (
                                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Respuesta</h3>
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <pre className="text-slate-900 whitespace-pre-wrap font-mono text-sm">
                                                {JSON.stringify(playgroundResponse, null, 2)}
                                            </pre>
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
};

export default DocsPage;