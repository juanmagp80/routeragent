import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { api_key } = await request.json();
        const testApiKey = api_key || 'ar_491ff6e1412a699f992978be9e97b9c7d5612c5a32cf3197';

        console.log('🔍 Debugging API key lookup process...');
        console.log('🔑 Testing with API key:', testApiKey);

        // 1. Hashear la API key como hace el controlador
        const keyHash = crypto.createHash('sha256').update(testApiKey).digest('hex');
        console.log('🔐 Generated hash:', keyHash.substring(0, 16) + '...');

        // 2. Buscar en la base de datos
        const { data: apiKeyData, error: apiKeyError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('key_hash', keyHash)
            .eq('is_active', true);

        console.log('📋 Database lookup result:', { apiKeyData, apiKeyError });

        // 3. También buscar sin filtro de activo para ver si existe
        const { data: anyKeyData, error: anyKeyError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('key_hash', keyHash);

        // 4. Ver el hash que está realmente en la base de datos para nuestra API key
        const { data: ourKey, error: ourKeyError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', '761ce82d-0f07-4f70-9b63-987a668b0907')
            .eq('is_active', true);

        // 5. Simular el guardado de actividad
        let saveResult = null;
        if (apiKeyData && apiKeyData.length > 0) {
            const testActivity = {
                user_id: apiKeyData[0].user_id,
                model_used: 'GPT-4o Mini',
                cost: 0.000034,
                latency_ms: 800,
                tokens_used: 50,
                prompt_preview: 'Debug test activity',
                capabilities: 'text-generation',
                endpoint: '/api/v1/route',
                method: 'POST',
                cost_usd: 0.000034,
                created_at: new Date().toISOString()
            };

            const { data: saveData, error: saveError } = await supabase
                .from('usage_logs')
                .insert([testActivity])
                .select();

            saveResult = { data: saveData, error: saveError };
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            test_api_key: testApiKey,
            generated_hash: keyHash,
            database_lookup: {
                found_active: apiKeyData,
                error: apiKeyError?.message,
                count: apiKeyData?.length || 0
            },
            any_key_lookup: {
                found_any: anyKeyData,
                error: anyKeyError?.message
            },
            our_user_keys: {
                data: ourKey,
                error: ourKeyError?.message
            },
            save_simulation: saveResult,
            analysis: {
                hash_matches: !!apiKeyData && apiKeyData.length > 0,
                would_save: !!apiKeyData && apiKeyData.length > 0,
                our_key_hash: ourKey?.[0]?.key_hash?.substring(0, 16) + '...'
            }
        });

    } catch (error) {
        console.error('💥 Error en debug-hash:', error);
        return NextResponse.json({ 
            error: 'Error en debug hash',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}