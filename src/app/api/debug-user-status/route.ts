import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../config/database';

export async function GET(request: NextRequest) {
    try {
        // Para testing, usar un user_id conocido
        const userId = '761ce82d-0f07-4f70-9b63-987a668b0907';

        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) {
            return NextResponse.json({ error: 'Error fetching user', details: userError });
        }

        // Obtener API keys del usuario
        const { data: apiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('id, name, is_active, created_at')
            .eq('user_id', userId);

        if (keysError) {
            return NextResponse.json({ error: 'Error fetching API keys', details: keysError });
        }

        // Calcular si es usuario nuevo
        const isRecentUser = userData.created_at &&
            new Date(userData.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
        const hasNoApiKeys = !apiKeys || apiKeys.length === 0;
        const isNewUser = isRecentUser && hasNoApiKeys;

        return NextResponse.json({
            user: userData,
            apiKeys: apiKeys || [],
            isRecentUser,
            hasNoApiKeys,
            isNewUser,
            timestamps: {
                now: new Date().toISOString(),
                userCreated: userData.created_at,
                timeDiff: Date.now() - new Date(userData.created_at).getTime(),
                hours: (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60)
            }
        });

    } catch (error) {
        console.error('❌ Error en debug-user-status:', error);
        return NextResponse.json({ error: 'Internal server error', details: error });
    }
}