"use client";

import { useState } from "react";

export default function ApiKeyValidator() {
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      alert('Ingresa una API key');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🔍 Validando API key:', apiKey.substring(0, 10) + '***');
      
      // Verificar caracteres problemáticos
      const hasNonAscii = /[^\x00-\x7F]/.test(apiKey);
      const cleanApiKey = apiKey.trim().replace(/[^\x00-\x7F]/g, '');
      
      console.log('🧪 Análisis de API key:', {
        original: apiKey.substring(0, 10) + '***',
        length: apiKey.length,
        hasNonAscii,
        cleanLength: cleanApiKey.length,
        clean: cleanApiKey.substring(0, 10) + '***'
      });

      // Prueba 1: Verificar si la API key existe en la base de datos
      console.log('🔍 Verificando en base de datos...');
      
      const testPayload = {
        input: "Test simple",
        task_type: "general", 
        priority: "cost"
      };

      const response = await fetch('/api/v1/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': cleanApiKey
        },
        body: JSON.stringify(testPayload)
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries()),
        analysis: {
          originalKey: apiKey.substring(0, 10) + '***',
          cleanKey: cleanApiKey.substring(0, 10) + '***',
          keyLength: apiKey.length,
          hasNonAscii,
          wasCleanedNeeded: apiKey !== cleanApiKey
        }
      });

      console.log('📊 Resultado completo:', {
        success: response.ok,
        status: response.status,
        data
      });

    } catch (error) {
      console.error('❌ Error en validación:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        analysis: {
          originalKey: apiKey.substring(0, 10) + '***',
          keyLength: apiKey.length,
          hasNonAscii: /[^\x00-\x7F]/.test(apiKey)
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🔍 Validador de API Key
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key a validar
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega aquí tu API key completa..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
            />
          </div>

          <button
            onClick={validateApiKey}
            disabled={loading || !apiKey.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔄 Validando...' : '🧪 Probar API Key'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Resultado de la Validación
          </h2>
          
          <div className="space-y-4">
            {/* Estado general */}
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {result.success ? '✅' : '❌'}
                <span className="font-medium">
                  {result.success ? 'API Key válida' : 'API Key inválida o error'}
                </span>
              </div>
              {result.status && (
                <div className="mt-2 text-sm text-gray-600">
                  Status: {result.status} {result.statusText}
                </div>
              )}
            </div>

            {/* Análisis de la API key */}
            {result.analysis && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">🔍 Análisis de la API Key</h3>
                <div className="space-y-1 text-sm">
                  <div>Longitud: {result.analysis.keyLength} caracteres</div>
                  <div>Contiene caracteres no-ASCII: {result.analysis.hasNonAscii ? '⚠️ Sí' : '✅ No'}</div>
                  {result.analysis.wasCleanedNeeded && (
                    <div className="text-amber-600">⚠️ Se removieron caracteres problemáticos</div>
                  )}
                </div>
              </div>
            )}

            {/* Respuesta de la API */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">📡 Respuesta de la API</h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                {JSON.stringify(result.data || result.error, null, 2)}
              </pre>
            </div>

            {/* Headers de respuesta */}
            {result.headers && (
              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-medium cursor-pointer">📋 Headers de Respuesta</summary>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-32 mt-2">
                  {JSON.stringify(result.headers, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}