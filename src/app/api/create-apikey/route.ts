import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
    try {
        const userId = '761ce82d-0f07-4f70-9b63-987a668b0907'; // Tu usuario actual
        const apiKeyValue = `sk-test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const keyPrefix = apiKeyValue.substring(0, 8);

        console.log('🔧 Creando API key para usuario:', userId);
        console.log('🔑 API key:', apiKeyValue);

        // Crear la API key en la base de datos
        const { data: newApiKey, error: createError } = await supabase
            .from('api_keys')
            .insert([{
                user_id: userId,
                key_value: apiKeyValue,
                key_prefix: keyPrefix,
                is_active: true,
                created_at: new Date().toISOString(),
                last_used: null
            }])
            .select()
            .single();

        if (createError) {
            console.error('❌ Error creando API key:', createError);
            return NextResponse.json({
                error: 'Error creando API key',
                details: createError.message
            }, { status: 500 });
        }

        // Verificar que se puede encontrar la API key
        const { data: verifyKey, error: verifyError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('key_value', apiKeyValue)
            .eq('is_active', true)
            .single();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            created_api_key: {
                id: newApiKey.id,
                user_id: newApiKey.user_id,
                key_value: apiKeyValue,
                key_prefix: keyPrefix,
                is_active: newApiKey.is_active
            },
            verification: {
                found: !!verifyKey,
                data: verifyKey
            },
            instructions: {
                message: 'API key creada exitosamente',
                next_step: `Usa esta API key en las pruebas: ${apiKeyValue}`,
                test_command: `curl -X POST http://localhost:3000/api/v1/route -H "Content-Type: application/json" -H "X-API-Key: ${apiKeyValue}" -d '{"task":"test","input":"Hello world"}'`
            }
        });

    } catch (error) {
        console.error('💥 Error en create-apikey:', error);
        return NextResponse.json({
            error: 'Error creando API key',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}