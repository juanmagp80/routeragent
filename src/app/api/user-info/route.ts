import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        // Obtener datos completos del usuario
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('Error obteniendo usuario:', userError);
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        // Obtener API keys del usuario
        const { data: apiKeys, error: keysError } = await supabaseAdmin
            .from('api_keys')
            .select('*')
            .eq('user_id', userId);

        if (keysError) {
            console.error('Error obteniendo API keys:', keysError);
        }

        return NextResponse.json({
            success: true,
            user: userData,
            apiKeys: apiKeys || [],
            summary: {
                plan: userData?.plan || 'free',
                totalApiKeys: apiKeys?.length || 0,
                activeApiKeys: apiKeys?.filter(key => key.is_active).length || 0,
                apiKeyLimit: userData?.api_key_limit || 2
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get user info',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}