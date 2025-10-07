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

export async function POST(request: NextRequest) {
    try {
        const userId = '761ce82d-0f07-4f70-9b63-987a668b0907';
        const userEmail = 'juanmagpdev@gmail.com';
        const userName = 'Juan Manuel Garrido';

        console.log('🏗️ Creando usuario con admin privileges...');

        // Usar supabaseAdmin para bypass RLS
        const { data: newUser, error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                email: userEmail,
                name: userName,
                company: '',
                plan: 'free',
                api_key_limit: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error insertando usuario:', insertError);
            return NextResponse.json({
                error: 'Error creating user',
                details: insertError,
                action: 'attempted_insert'
            });
        }

        console.log('✅ Usuario creado exitosamente:', newUser);

        // Verificar que ahora existe
        const { data: checkUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (checkError) {
            return NextResponse.json({
                error: 'Error verifying user creation',
                details: checkError
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Usuario creado exitosamente en tabla users',
            user: newUser,
            verification: checkUser,
            explanation: 'Used service role key to bypass RLS policies',
            next_steps: [
                'Dashboard debería mostrar métricas ahora',
                'Actividad reciente debería aparecer',
                'Refrescar la página del dashboard'
            ]
        });

    } catch (error) {
        console.error('❌ Error en fix-user-table:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error,
            note: 'May need SUPABASE_SERVICE_ROLE_KEY environment variable'
        });
    }
}