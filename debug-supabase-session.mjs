// Script para verificar la sesión de Supabase y sincronizar el usuario
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjQyMTksImV4cCI6MjA3MzYwMDIxOX0._2aqWnPZlUGTIz-8INCWVpPpowulvmcVrB9R6BRoIvE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
    try {
        console.log('🔍 === VERIFICANDO SESIÓN DE SUPABASE ===');
        
        // Obtener sesión actual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Error getting session:', sessionError);
            return;
        }
        
        if (sessionData?.session) {
            const user = sessionData.session.user;
            console.log('✅ Usuario autenticado en Supabase:');
            console.log('📧 Email:', user.email);
            console.log('🆔 Supabase User ID:', user.id);
            console.log('👤 Metadata:', user.user_metadata);
            console.log('🕐 Created at:', user.created_at);
            
            // Verificar si existe en la tabla users
            const { data: userRecord, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
                
            if (userError && userError.code !== 'PGRST116') {
                console.error('❌ Error checking user record:', userError);
                return;
            }
            
            if (userRecord) {
                console.log('✅ Usuario existe en tabla users:', userRecord);
            } else {
                console.log('⚠️ Usuario NO existe en tabla users. Creando...');
                
                // Crear usuario en la tabla
                const newUser = {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario Google',
                    company: '',
                    plan: 'free',
                    api_key_limit: 3,
                    is_active: true,
                    email_verified: true,
                    preferences: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                const { data: createdUser, error: createError } = await supabase
                    .from('users')
                    .insert([newUser])
                    .select()
                    .single();
                    
                if (createError) {
                    console.error('❌ Error creating user:', createError);
                } else {
                    console.log('✅ Usuario creado en tabla users:', createdUser);
                }
            }
            
        } else {
            console.log('❌ No hay sesión activa en Supabase');
            console.log('💡 Para debuggear, ve a: http://localhost:3000/login');
        }
        
    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

debugAuth();
