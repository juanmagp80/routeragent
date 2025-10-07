"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "../../../config/database";

export default function DataDebugger() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugUserData = async () => {
    if (!user) {
      alert('No hay usuario autenticado');
      return;
    }

    setLoading(true);
    console.log('🔍 [DEBUG] Iniciando debug de datos para usuario:', user.id);

    try {
      const results = await Promise.allSettled([
        // 1. Datos del usuario
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single(),

        // 2. API Keys
        supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', user.id),

        // 3. Usage logs
        supabase
          .from('usage_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),

        // 4. Tasks
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),

        // 5. Usage records
        supabase
          .from('usage_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),

        // 6. Contar registros totales
        supabase
          .from('usage_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      const [userResult, apiKeysResult, usageLogsResult, tasksResult, usageRecordsResult, countResult] = results;

      const debugData = {
        user: {
          status: userResult.status,
          data: userResult.status === 'fulfilled' ? userResult.value.data : null,
          error: userResult.status === 'rejected' ? userResult.reason : userResult.status === 'fulfilled' ? userResult.value.error : null
        },
        apiKeys: {
          status: apiKeysResult.status,
          count: apiKeysResult.status === 'fulfilled' ? (apiKeysResult.value.data?.length || 0) : 0,
          data: apiKeysResult.status === 'fulfilled' ? apiKeysResult.value.data : null,
          error: apiKeysResult.status === 'rejected' ? apiKeysResult.reason : apiKeysResult.status === 'fulfilled' ? apiKeysResult.value.error : null
        },
        usageLogs: {
          status: usageLogsResult.status,
          count: usageLogsResult.status === 'fulfilled' ? (usageLogsResult.value.data?.length || 0) : 0,
          data: usageLogsResult.status === 'fulfilled' ? usageLogsResult.value.data?.slice(0, 5) : null, // Solo primeros 5
          error: usageLogsResult.status === 'rejected' ? usageLogsResult.reason : usageLogsResult.status === 'fulfilled' ? usageLogsResult.value.error : null
        },
        tasks: {
          status: tasksResult.status,
          count: tasksResult.status === 'fulfilled' ? (tasksResult.value.data?.length || 0) : 0,
          data: tasksResult.status === 'fulfilled' ? tasksResult.value.data?.slice(0, 5) : null, // Solo primeros 5
          error: tasksResult.status === 'rejected' ? tasksResult.reason : tasksResult.status === 'fulfilled' ? tasksResult.value.error : null
        },
        usageRecords: {
          status: usageRecordsResult.status,
          count: usageRecordsResult.status === 'fulfilled' ? (usageRecordsResult.value.data?.length || 0) : 0,
          data: usageRecordsResult.status === 'fulfilled' ? usageRecordsResult.value.data?.slice(0, 5) : null, // Solo primeros 5
          error: usageRecordsResult.status === 'rejected' ? usageRecordsResult.reason : usageRecordsResult.status === 'fulfilled' ? usageRecordsResult.value.error : null
        },
        totalCount: {
          status: countResult.status,
          count: countResult.status === 'fulfilled' ? countResult.value.count : 0,
          error: countResult.status === 'rejected' ? countResult.reason : countResult.status === 'fulfilled' ? countResult.value.error : null
        }
      };

      console.log('🔍 [DEBUG] Resultados completos:', debugData);
      setDebugInfo(debugData);

    } catch (error) {
      console.error('❌ [DEBUG] Error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          ❌ No hay usuario autenticado
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🔍 Debug de Datos del Usuario
        </h1>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">👤 Usuario Actual</h3>
            <div className="text-sm space-y-1">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Nombre: {user.name || 'N/A'}</div>
            </div>
          </div>

          <button
            onClick={debugUserData}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔄 Analizando...' : '🧪 Analizar Datos'}
          </button>
        </div>
      </div>

      {debugInfo && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Resultados del Análisis
          </h2>
          
          <div className="space-y-6">
            {/* Resumen */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">📈 Resumen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">API Keys</div>
                  <div className="font-bold text-lg">{debugInfo.apiKeys?.count || 0}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Usage Logs</div>
                  <div className="font-bold text-lg">{debugInfo.usageLogs?.count || 0}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Tasks</div>
                  <div className="font-bold text-lg">{debugInfo.tasks?.count || 0}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Usage Records</div>
                  <div className="font-bold text-lg">{debugInfo.usageRecords?.count || 0}</div>
                </div>
              </div>
            </div>

            {/* Datos detallados */}
            <div className="space-y-4">
              {Object.entries(debugInfo).map(([key, value]: [string, any]) => (
                <details key={key} className="bg-gray-50 p-4 rounded-lg">
                  <summary className="font-medium cursor-pointer capitalize flex items-center gap-2">
                    {key === 'usageLogs' ? '📊 Usage Logs' :
                     key === 'apiKeys' ? '🔑 API Keys' :
                     key === 'tasks' ? '📋 Tasks' :
                     key === 'usageRecords' ? '💰 Usage Records' :
                     key === 'user' ? '👤 Usuario' :
                     key === 'totalCount' ? '🔢 Conteo Total' : key}
                    <span className="text-sm text-gray-500">
                      ({value?.status === 'fulfilled' ? '✅' : '❌'} {value?.count || 0} registros)
                    </span>
                  </summary>
                  <div className="mt-3">
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}