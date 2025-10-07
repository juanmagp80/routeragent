import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { action } = await request.json();
        const targetUserId = '761ce82d-0f07-4f70-9b63-987a668b0907'; // Tu usuario

        if (action === 'create_new') {
            // Crear nueva API key para tu usuario
            const newApiKey = `ar_${crypto.randomBytes(8).toString('hex')}${crypto.randomBytes(16).toString('hex')}`;
            const keyHash = crypto.createHash('sha256').update(newApiKey).digest('hex');
            const keyPrefix = newApiKey.substring(0, 13); // ar_ + 8 chars

            const { data: newKey, error: createError } = await supabase
                .from('api_keys')
                .insert([{
                    user_id: targetUserId,
                    key_hash: keyHash,
                    key_prefix: keyPrefix,
                    name: 'Test Key - Auto Created',
                    plan: 'free',
                    usage_limit: 10000,
                    usage_count: 0,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (createError) {
                return NextResponse.json({
                    error: 'Error creando API key',
                    details: createError.message
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                action: 'created',
                api_key: newApiKey,
                key_data: newKey,
                instructions: {
                    message: 'Nueva API key creada exitosamente',
                    api_key_to_use: newApiKey,
                    test_command: `curl -X POST http://localhost:3000/api/v1/route -H "Content-Type: application/json" -H "X-API-Key: ${newApiKey}" -d '{"task":"test","input":"Hello world"}'`
                }
            });

        } else if (action === 'assign_existing') {
            // Tomar una API key activa existente y reasignarla a tu usuario
            const { data: activeKey, error: findError } = await supabase
                .from('api_keys')
                .select('*')
                .eq('is_active', true)
                .limit(1)
                .single();

            if (findError || !activeKey) {
                return NextResponse.json({
                    error: 'No se encontró API key activa para reasignar',
                    details: findError?.message
                }, { status: 404 });
            }

            // Actualizar para que pertenezca a tu usuario
            const { data: updatedKey, error: updateError } = await supabase
                .from('api_keys')
                .update({
                    user_id: targetUserId,
                    name: 'Reassigned Test Key',
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeKey.id)
                .select()
                .single();

            if (updateError) {
                return NextResponse.json({
                    error: 'Error reasignando API key',
                    details: updateError.message
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                action: 'reassigned',
                message: 'API key reasignada a tu usuario',
                key_data: updatedKey,
                note: 'Usa el key_prefix para generar la API key completa'
            });
        }

        return NextResponse.json({
            error: 'Acción no válida. Usa "create_new" o "assign_existing"'
        }, { status: 400 });

    } catch (error) {
        console.error('💥 Error en fix-apikey:', error);
        return NextResponse.json({
            error: 'Error procesando API key',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}