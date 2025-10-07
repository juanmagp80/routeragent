import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar el service role key para diagnóstico
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function GET(request: NextRequest) {
    try {
        const userId = '761ce82d-0f07-4f70-9b63-987a668b0907';
        
        // 1. Verificar auth.uid() con cliente anon
        const { data: authCheck, error: authError } = await supabaseAnon
            .rpc('get_current_user_id');
        
        // 2. Verificar datos del usuario con admin
        const { data: userAdmin, error: userAdminError } = await supabaseAdmin
            .from('users')
            .select('id, email, name')
            .eq('id', userId)
            .single();

        // 3. Verificar si el usuario existe en auth.users
        const { data: authUser, error: authUserError } = await supabaseAdmin
            .from('auth.users')
            .select('id, email')
            .eq('id', userId)
            .single();

        return NextResponse.json({
            diagnosis: {
                target_user_id: userId,
                auth_uid_from_client: authCheck,
                auth_uid_error: authError,
                user_exists_in_users_table: !userAdminError,
                user_exists_in_auth_users: !authUserError,
                problem_analysis: {
                    auth_working: !authError,
                    user_in_app_db: !userAdminError,
                    user_in_auth_db: !authUserError,
                    ids_match: authCheck === userId
                }
            },
            data: {
                auth_user: authUser,
                app_user: userAdmin
            },
            recommendation: !authError && authCheck === userId 
                ? 'Auth is working, RLS should work'
                : 'Auth issue - user not properly authenticated'
        });

    } catch (error) {
        console.error('❌ Error en diagnose-auth:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            details: error 
        });
    }
}