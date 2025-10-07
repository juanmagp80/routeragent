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
        const userId = '761ce82d-0f07-4f70-9b63-987a668b0907';
        
        console.log('🔍 Consultando usuario con admin privileges...');
        
        // Consultar usuario con privilegios de admin
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        // Consultar API keys con privilegios de admin
        const { data: apiKeys, error: keysError } = await supabaseAdmin
            .from('api_keys')
            .select('id, name, is_active, created_at')
            .eq('user_id', userId);

        // Consultar actividad reciente
        const { data: recentActivity, error: activityError } = await supabaseAdmin
            .from('usage_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            user_query: { data: userData, error: userError },
            api_keys_query: { data: apiKeys, error: keysError },
            activity_query: { data: recentActivity, error: activityError },
            analysis: {
                user_exists: !userError && userData,
                has_api_keys: !keysError && apiKeys && apiKeys.length > 0,
                has_activity: !activityError && recentActivity && recentActivity.length > 0,
                problem_diagnosis: userError ? 'Usuario no encontrado' : 
                                   (keysError ? 'Error consultando API keys' : 
                                   (!recentActivity || recentActivity.length === 0 ? 'Sin actividad' : 'Todo OK'))
            }
        });

    } catch (error) {
        console.error('❌ Error en admin-check:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            details: error 
        });
    }
}