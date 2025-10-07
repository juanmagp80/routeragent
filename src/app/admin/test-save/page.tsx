"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function TestSavePage() {
    const { user } = useAuth();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testSave = async () => {
        if (!user?.id) {
            alert('Usuario no autenticado');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            console.log('🧪 [TEST-SAVE] Probando guardado para usuario:', user.id);

            const response = await fetch('/api/test-save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    test_message: `Prueba de guardado - ${new Date().toLocaleString()}`
                })
            });

            const data = await response.json();
            console.log('📊 [TEST-SAVE] Resultado:', data);
            setResult(data);

        } catch (error) {
            console.error('❌ [TEST-SAVE] Error:', error);
            setResult({
                error: 'Error en la prueba',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        } finally {
            setLoading(false);
        }
    };

    const testApiCall = async () => {
        if (!user?.id) {
            alert('Usuario no autenticado - necesitas una API key');
            return;
        }

        // Buscar una API key del usuario
        const apiKey = prompt('Ingresa tu API key para la prueba:');
        if (!apiKey) return;

        setLoading(true);
        setResult(null);

        try {
            console.log('🚀 [TEST-API] Probando llamada API real...');

            const response = await fetch('/api/v1/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({
                    input: `Prueba de API call - ${new Date().toLocaleString()}`,
                    task_type: 'general',
                    priority: 'cost'
                })
            });

            const data = await response.json();
            console.log('📊 [TEST-API] Resultado:', data);
            setResult({
                api_call_result: data,
                message: 'Llamada API completada - verifica si se guardó en usage_logs'
            });

        } catch (error) {
            console.error('❌ [TEST-API] Error:', error);
            setResult({
                error: 'Error en la llamada API',
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    🧪 Pruebas de Guardado de Datos
                </h1>

                <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h2 className="font-semibold text-blue-900 mb-2">Usuario Actual:</h2>
                        <div className="text-sm text-blue-700">
                            <div>ID: {user?.id || 'No autenticado'}</div>
                            <div>Email: {user?.email || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={testSave}
                        disabled={loading || !user?.id}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? '🔄 Probando...' : '💾 Probar Guardado Directo'}
                    </button>

                    <button
                        onClick={testApiCall}
                        disabled={loading || !user?.id}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? '🔄 Probando...' : '🚀 Probar API Call Real'}
                    </button>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Guardado Directo:</strong> Inserta directamente en usage_logs</p>
                    <p><strong>API Call Real:</strong> Llama a /api/v1/route que debería guardar automáticamente</p>
                </div>
            </div>

            {result && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        📊 Resultado de la Prueba
                    </h2>

                    <div className={`p-4 rounded-lg mb-4 ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {result.error ? '❌' : '✅'}
                            <span className="font-medium">
                                {result.error ? 'Error en la prueba' : 'Prueba exitosa'}
                            </span>
                        </div>
                        {result.message && (
                            <div className="text-sm text-gray-600 mb-2">
                                {result.message}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">📋 Detalles Completos:</h3>
                        <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>

                    {result.recent_logs && result.recent_logs.length > 0 && (
                        <div className="mt-4 bg-emerald-50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2 text-emerald-800">
                                ✅ Registros Recientes en usage_logs ({result.recent_logs.length}):
                            </h3>
                            <div className="space-y-2">
                                {result.recent_logs.map((log: any, index: number) => (
                                    <div key={index} className="text-xs bg-white p-2 rounded border">
                                        <div><strong>Tipo:</strong> {log.task_type}</div>
                                        <div><strong>Modelo:</strong> {log.model_used}</div>
                                        <div><strong>Costo:</strong> ${log.cost}</div>
                                        <div><strong>Fecha:</strong> {new Date(log.created_at).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}