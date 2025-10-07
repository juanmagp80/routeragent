// Script para verificar datos de métricas del usuario
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjQyMTksImV4cCI6MjA3MzYwMDIxOX0._2aqWnPZlUGTIz-8INCWVpPpowulvmcVrB9R6BRoIvE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyUserMetrics() {
    try {
        console.log('🔍 === VERIFICANDO DATOS DE MÉTRICAS ===');
        
        // Obtener sesión actual para conseguir el user ID
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData?.session) {
            console.error('❌ No hay sesión activa:', sessionError);
            return;
        }
        
        const userId = sessionData.session.user.id;
        console.log('👤 Usuario ID:', userId);
        
        // Verificar API keys
        const { data: apiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', userId);
            
        console.log('🔑 API Keys encontradas:', apiKeys?.length || 0);
        if (apiKeys?.length) {
            console.log('   Detalles:', apiKeys.map(k => ({ 
                id: k.id, 
                name: k.name, 
                usage_count: k.usage_count,
                is_active: k.is_active 
            })));
        }
        
        // Verificar tasks
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .limit(5);
            
        console.log('📋 Tasks encontradas:', tasks?.length || 0);
        if (tasks?.length) {
            console.log('   Ejemplos:', tasks.map(t => ({ 
                id: t.id, 
                model_selected: t.model_selected,
                cost: t.cost,
                latency_ms: t.latency_ms,
                status: t.status,
                created_at: t.created_at 
            })));
        } else if (tasksError) {
            console.log('⚠️ Error en tasks (puede que la tabla no exista):', tasksError.message);
        }
        
        // Verificar usage_records
        const { data: usageRecords, error: recordsError } = await supabase
            .from('usage_records')
            .select('*')
            .eq('user_id', userId)
            .limit(5);
            
        console.log('📊 Usage records encontrados:', usageRecords?.length || 0);
        if (usageRecords?.length) {
            console.log('   Ejemplos:', usageRecords.map(r => ({ 
                id: r.id, 
                model_used: r.model_used,
                cost: r.cost,
                latency_ms: r.latency_ms,
                created_at: r.created_at 
            })));
        } else if (recordsError) {
            console.log('⚠️ Error en usage_records (puede que la tabla no exista):', recordsError.message);
        }
        
        // Verificar usage_logs
        const { data: usageLogs, error: logsError } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', userId)
            .limit(5);
            
        console.log('📝 Usage logs encontrados:', usageLogs?.length || 0);
        if (usageLogs?.length) {
            console.log('   Ejemplos:', usageLogs.map(l => ({ 
                id: l.id, 
                model_used: l.model_used,
                cost: l.cost,
                created_at: l.created_at 
            })));
        } else if (logsError) {
            console.log('⚠️ Error en usage_logs (puede que la tabla no exista):', logsError.message);
        }
        
        // Verificar datos del usuario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, name, plan, api_key_limit, created_at')
            .eq('id', userId)
            .single();
            
        if (userData) {
            console.log('👤 Datos del usuario:', userData);
        } else {
            console.log('❌ Error obteniendo datos del usuario:', userError);
        }
        
    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

verifyUserMetrics();
