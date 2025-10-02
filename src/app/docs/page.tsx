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
            const response = await fetch('http://localhost:3001/v1/route', {
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
        { id: "quickstart", label: "Quick Start", icon: Zap },
        { id: "authentication", label: "Authentication", icon: Shield },
        { id: "endpoints", label: "Endpoints", icon: Terminal },
        { id: "examples", label: "Examples", icon: Code },
        { id: "playground", label: "Playground", icon: Play }
    ];

    const codeExamples = {
        curl: `curl -X POST https://api.agentrouter.com/v1/route \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ar_your_api_key" \\
  -d '{
    "input": "Resume este documento en 3 puntos",
    "task_type": "summary"
  }'`,

        javascript: `const response = await fetch('https://api.agentrouter.com/v1/route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ar_your_api_key'
  },
  body: JSON.stringify({
    input: 'Resume este documento en 3 puntos',
    task_type: 'summary'
  })
});

const data = await response.json();
console.log(data.response);`,

        python: `import requests

response = requests.post(
    'https://api.agentrouter.com/v1/route',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ar_your_api_key'
    },
    json={
        'input': 'Resume este documento en 3 puntos',
        'task_type': 'summary'
    }
)

data = response.json()
print(data['response'])`,

        node: `const AgentRouter = require('agentrouter-sdk');

const router = new AgentRouter('ar_your_api_key');

const result = await router.route({
  input: 'Resume este documento en 3 puntos',
  taskType: 'summary'
});

console.log(result.response);`
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

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {activeTab === "quickstart" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Quick Start</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Integra RouterAI en tu aplicación en menos de 5 minutos.
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
                                        Crea una cuenta y genera tu API key desde el dashboard.
                                    </p>
                                    <div className="bg-slate-900 rounded-lg p-4 relative">
                                        <button
                                            onClick={() => copyToClipboard('curl -X POST https://api.agentrouter.com/v1/api-keys', 'step1')}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                                        >
                                            {copiedCode === 'step1' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                        <code className="text-emerald-400 font-mono text-sm">
                                            curl -X POST https://api.agentrouter.com/v1/api-keys
                                        </code>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                                            2
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Haz tu primera llamada</h3>
                                    </div>
                                    <p className="text-slate-600 mb-4">
                                        Reemplaza tu llamada actual a OpenAI/Anthropic con AgentRouter.
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
                                        <div className="flex items-center">
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
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Authentication</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        AgentRouter usa API Keys para autenticación. Todas las requests requieren un Bearer token.
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Formato de API Key</h3>
                                    <p className="text-slate-600 mb-4">
                                        Todas las API keys tienen el formato <code className="bg-slate-100 px-2 py-1 rounded">ar_xxxxxxxx...</code>
                                    </p>
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <code className="text-emerald-400 font-mono text-sm">
                                            Authorization: Bearer ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a
                                        </code>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Crear API Key</h3>
                                    <div className="bg-slate-900 rounded-lg p-4 relative">
                                        <button
                                            onClick={() => copyToClipboard(`curl -X POST https://api.agentrouter.com/v1/api-keys \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Mi App",
    "plan": "pro",
    "user_id": "user-123"
  }'`, 'auth-create')}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                                        >
                                            {copiedCode === 'auth-create' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                        <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                                            {`curl -X POST https://api.agentrouter.com/v1/api-keys \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Mi App",
    "plan": "pro", 
    "user_id": "user-123"
  }'`}
                                        </pre>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <Shield className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-yellow-800">Seguridad</h4>
                                            <p className="text-yellow-700 text-sm">
                                                Guarda tu API key de forma segura. Solo se muestra una vez al crearla.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "endpoints" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">API Endpoints</h2>
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
  "input": "string (required)",
  "task_type": "summary|translation|analysis|general",
  "model_preferences": {
    "preferred_models": ["gpt-4o", "claude-3"],
    "avoid_models": ["gpt-3.5"],
    "quality_target": "high|medium|low",
    "cost_target": "low|medium|high"
  }
}`}
                                        </pre>
                                    </div>

                                    <h4 className="font-bold text-slate-900 mb-2">Response:</h4>
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <pre className="text-blue-400 font-mono text-sm">
                                            {`{
  "selected_model": "GPT-4o Mini",
  "cost": 0.00002,
  "estimated_time": 89,
  "response": "Respuesta generada...",
  "task_type": "general",
  "success": true
}`}
                                        </pre>
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
      "model": "gpt-4o-mini",
      "count": 45,
      "sum": 0.675
    }
  ],
  "summary": {
    "total_cost": 1.588,
    "total_requests": 224,
    "avg_cost_per_request": 0.007
  },
  "success": true
}`}
                                        </pre>
                                    </div>
                                </div>

                                {/* API Keys Endpoints */}
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">API Key Management</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold mr-4 w-16 text-center">
                                                POST
                                            </span>
                                            <code className="font-mono">/v1/api-keys</code>
                                            <span className="text-slate-500 ml-4">Crear API key</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mr-4 w-16 text-center">
                                                GET
                                            </span>
                                            <code className="font-mono">/v1/api-keys</code>
                                            <span className="text-slate-500 ml-4">Listar API keys</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold mr-4 w-16 text-center">
                                                DELETE
                                            </span>
                                            <code className="font-mono">/v1/api-keys/:id</code>
                                            <span className="text-slate-500 ml-4">Desactivar API key</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "examples" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Code Examples</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Ejemplos de integración en diferentes lenguajes de programación.
                                    </p>
                                </div>

                                {/* Language Tabs */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="border-b border-slate-200">
                                        <div className="flex">
                                            {Object.keys(codeExamples).map((lang) => (
                                                <button
                                                    key={lang}
                                                    className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-emerald-500"
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
                                            code: `// Antes: Solo GPT-4 ($$$)
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: query }]
});

// Después: Router inteligente
const response = await agentRouter.route({
  input: query,
  taskType: "general"
});`
                                        },
                                        {
                                            title: "Análisis de Documentos",
                                            description: "Procesamiento masivo optimizado",
                                            savings: "92% ahorro",
                                            code: `// Procesar 1000 documentos
for (const doc of documents) {
  const analysis = await agentRouter.route({
    input: doc.content,
    taskType: "analysis"
  });
  
  // Router elige modelo óptimo automáticamente
  console.log(analysis.response);
}`
                                        }
                                    ].map((useCase, index) => (
                                        <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-slate-900">{useCase.title}</h3>
                                                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                                                    {useCase.savings}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mb-4">{useCase.description}</p>
                                            <div className="bg-slate-900 rounded-lg p-4">
                                                <pre className="text-emerald-400 font-mono text-xs overflow-x-auto">
                                                    {useCase.code}
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "playground" && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">API Playground</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Prueba la API directamente desde aquí. Perfecto para testing y exploración.
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Test Request</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Input Text:
                                            </label>
                                            <textarea
                                                value={playgroundInput}
                                                onChange={(e) => setPlaygroundInput(e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                rows={3}
                                                placeholder="Escribe tu consulta aquí..."
                                            />
                                        </div>

                                        <button
                                            onClick={runPlayground}
                                            disabled={playgroundLoading}
                                            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center"
                                        >
                                            {playgroundLoading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <Play className="w-5 h-5 mr-2" />
                                            )}
                                            {playgroundLoading ? 'Procesando...' : 'Ejecutar'}
                                        </button>

                                        {playgroundResponse && (
                                            <div className="mt-6">
                                                <h4 className="font-bold text-slate-900 mb-2">Response:</h4>
                                                <div className="bg-slate-900 rounded-lg p-4">
                                                    <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                                                        {JSON.stringify(playgroundResponse, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;