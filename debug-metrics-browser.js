// Script para debuggear en la consola del navegador
// Copia y pega esto en la consola del navegador (F12)

console.log('🔍 === DEBUG DE MÉTRICAS REALES ===');

// Obtener el ID del usuario desde el AuthContext
const userId = '761ce82d-0f07-4f70-9b63-987a668b0907';

// Importar Supabase (ya debería estar disponible en el navegador)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjQyMTksImV4cCI6MjA3MzYwMDIxOX0._2aqWnPZlUGTIz-8INCWVpPpowulvmcVrB9R6BRoIvE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para debuggear métricas
async function debugMetrics() {
    console.log('📊 Obteniendo datos para usuario:', userId);
    
    try {
        // API Keys
        const { data: apiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('id, is_active, name, usage_count')
            .eq('user_id', userId);
            
        console.log('🔑 API Keys:', apiKeys, 'Error:', keysError);
        
        // Usuario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('api_key_limit, plan, name')
            .eq('id', userId)
            .single();
            
        console.log('👤 Usuario:', userData, 'Error:', userError);
        
        // Tasks
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id, cost')
            .eq('user_id', userId);
            
        console.log('📋 Tasks:', tasks, 'Error:', tasksError);
        
        console.log('✅ Resumen:');
        console.log('- API Keys count:', apiKeys?.length || 0);
        console.log('- Tasks count:', tasks?.length || 0);
        console.log('- User plan:', userData?.plan);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar el debug
debugMetrics();
