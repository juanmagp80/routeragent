import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar el service role key para bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' });
        }
        
        console.log('📊 [ADMIN-METRICS] Cargando métricas para usuario:', userId);
        
        // Consultas optimizadas con privilegios de admin
        const [
            { data: apiKeys, error: apiKeysError },
            { data: recentActivity, error: activityError },
            { data: usageLogs, error: logsError },
            { data: userData, error: userError }
        ] = await Promise.all([
            // API Keys
            supabaseAdmin
                .from('api_keys')
                .select('id, name, is_active')
                .eq('user_id', userId)
                .eq('is_active', true),
            
            // Actividad reciente (últimas 10)
            supabaseAdmin
                .from('usage_logs')
                .select('id, task_type, model_used, cost, created_at, status, tokens_used')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10),
            
            // Todos los logs para calcular totales
            supabaseAdmin
                .from('usage_logs')
                .select('cost, latency_ms')
                .eq('user_id', userId),
            
            // Datos del usuario
            supabaseAdmin
                .from('users')
                .select('api_key_limit, plan')
                .eq('id', userId)
                .single()
        ]);

        // Procesar resultados
        const metrics = {
            requests: usageLogs?.length || 0,
            cost: usageLogs?.reduce((sum, log) => sum + parseFloat(log.cost || '0'), 0) || 0,
            limit: userData?.api_key_limit ? userData.api_key_limit * 1000 : 1000,
            apiKeysCount: apiKeys?.length || 0,
            recentActivity: recentActivity?.map(activity => ({
                id: activity.id,
                task_type: activity.task_type || 'unknown',
                model_used: activity.model_used || 'unknown',
                cost: parseFloat(activity.cost || '0'),
                created_at: activity.created_at,
                status: activity.status || 'completed',
                tokens_used: activity.tokens_used
            })) || []
        };

        const stats = {
            totalRequests: usageLogs?.length || 0,
            totalCost: metrics.cost,
            requestsThisMonth: usageLogs?.length || 0, // Simplificado
            costThisMonth: metrics.cost,
            avgResponseTime: (usageLogs && usageLogs.length > 0) 
                ? Math.round(usageLogs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / usageLogs.length)
                : 0,
            mostUsedModel: 'GPT-4o Mini' // Simplificado
        };

        console.log('✅ [ADMIN-METRICS] Métricas cargadas:', {
            requests: metrics.requests,
            cost: metrics.cost.toFixed(4),
            activityCount: metrics.recentActivity.length,
            avgTime: stats.avgResponseTime
        });

        // Debug: verificar si hay errores en las consultas
        console.log('🔍 [DEBUG] Errores en consultas:', {
            apiKeysError,
            activityError,
            logsError,
            userError
        });

        console.log('🔍 [DEBUG] Datos raw:', {
            apiKeysCount: apiKeys?.length,
            activityCount: recentActivity?.length,
            logsCount: usageLogs?.length,
            userData: !!userData
        });

        return NextResponse.json({
            success: true,
            metrics,
            stats,
            loadedWith: 'admin_privileges',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error en admin-metrics:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            details: error 
        });
    }
}