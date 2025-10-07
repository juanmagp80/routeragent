import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const testApiKey = body.api_key || 'sk-test-1234567890abcdef';

        console.log('🔍 Testing API key lookup para:', testApiKey);

        // 1. Buscar la API key en la tabla como hace el controlador
        const { data: apiKeyData, error: apiKeyError } = await supabase
            .from('api_keys')
            .select('id, user_id, key_value, key_prefix, is_active')
            .eq('key_value', testApiKey)
            .eq('is_active', true)
            .single();

        console.log('📋 Resultado búsqueda API key:', { apiKeyData, apiKeyError });

        // 2. Si no encuentra con key_value, buscar por key_prefix
        let alternativeSearch = null;
        if (apiKeyError) {
            const keyPrefix = testApiKey.substring(0, 8);
            const { data: altData, error: altError } = await supabase
                .from('api_keys')
                .select('id, user_id, key_value, key_prefix, is_active')
                .eq('key_prefix', keyPrefix)
                .eq('is_active', true);

            alternativeSearch = { data: altData, error: altError, keyPrefix };
            console.log('🔍 Búsqueda alternativa por prefix:', alternativeSearch);
        }

        // 3. Ver todas las API keys disponibles
        const { data: allKeys, error: allKeysError } = await supabase
            .from('api_keys')
            .select('id, user_id, key_value, key_prefix, is_active')
            .limit(5);

        // 4. Simular el guardado de actividad
        let saveResult = null;
        if (apiKeyData?.user_id) {
            const testActivity = {
                user_id: apiKeyData.user_id,
                model_used: 'GPT-4o Mini',
                cost: 0.001,
                latency_ms: 800,
                tokens_used: 100,
                prompt_preview: 'Test activity',
                capabilities: 'text-generation',
                endpoint: '/api/v1/route',
                method: 'POST',
                cost_usd: 0.001,
                created_at: new Date().toISOString()
            };

            const { data: saveData, error: saveError } = await supabase
                .from('usage_logs')
                .insert([testActivity])
                .select();

            saveResult = { data: saveData, error: saveError };
            console.log('💾 Resultado simulación guardado:', saveResult);
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            test_api_key: testApiKey,
            api_key_lookup: {
                data: apiKeyData,
                error: apiKeyError?.message
            },
            alternative_search: alternativeSearch,
            all_api_keys: {
                data: allKeys,
                error: allKeysError?.message
            },
            save_simulation: saveResult,
            analysis: {
                api_key_found: !!apiKeyData,
                user_id_from_key: apiKeyData?.user_id,
                would_save_activity: !!apiKeyData?.user_id
            }
        });

    } catch (error) {
        console.error('💥 Error en test-apikey:', error);
        return NextResponse.json({
            error: 'Error en test',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}