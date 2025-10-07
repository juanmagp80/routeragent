import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

        console.log('📊 [SIMPLE-ACTIVITY] Cargando actividad para:', userId);

        // Solo obtener actividad reciente con admin - usando columnas que sabemos que existen
        const { data: recentActivity, error: activityError } = await supabaseAdmin
            .from('usage_logs')
            .select('id, model_used, cost, created_at, latency_ms, tokens_used')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        console.log('📋 [SIMPLE-ACTIVITY] Resultado:', {
            error: activityError,
            count: recentActivity?.length || 0,
            data: recentActivity
        });

        if (activityError) {
            return NextResponse.json({
                error: 'Error fetching activity',
                details: activityError
            });
        }

        const formattedActivity = recentActivity?.map(activity => ({
            id: activity.id,
            task_type: 'general', // Valor por defecto ya que no existe la columna
            model_used: activity.model_used || 'unknown',
            cost: parseFloat(activity.cost || '0'),
            created_at: activity.created_at,
            status: 'completed', // Valor por defecto ya que no existe la columna
            tokens_used: activity.tokens_used,
            latency_ms: activity.latency_ms
        })) || [];

        return NextResponse.json({
            success: true,
            activity: formattedActivity,
            count: formattedActivity.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error en simple-activity:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error
        });
    }
}