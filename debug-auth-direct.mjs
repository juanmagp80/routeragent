import { supabase } from './src/config/database.js';

async function debugCurrentAuth() {
    console.log('🔍 === DEBUG DE AUTENTICACIÓN ===');
    
    try {
        // 1. Verificar sesión actual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Error obteniendo sesión:', sessionError);
            return;
        }
        
        if (sessionData.session) {
            console.log('✅ Sesión activa encontrada');
            console.log('📧 Email:', sessionData.session.user.email);
            console.log('🆔 ID:', sessionData.session.user.id);
            console.log('📅 Creado:', sessionData.session.user.created_at);
            
            // 2. Verificar si existe en tabla users
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', sessionData.session.user.id)
                .single();
                
            if (userError) {
                console.error('❌ Error buscando usuario en tabla users:', userError);
                if (userError.code === 'PGRST116') {
                    console.log('⚠️ Usuario no existe en tabla users, necesita sincronización');
                    
                    // 3. Crear usuario en tabla users
                    const newUser = {
                        id: sessionData.session.user.id,
                        email: sessionData.session.user.email,
                        name: sessionData.session.user.user_metadata?.full_name || 
                              sessionData.session.user.user_metadata?.name || 
                              sessionData.session.user.email?.split('@')[0] || 
                              'Usuario',
                        company: '',
                        plan: 'free',
                        api_key_limit: 3,
                        is_active: true,
                        email_verified: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    
                    const { data: createdUser, error: createError } = await supabase
                        .from('users')
                        .insert([newUser])
                        .select()
                        .single();
                        
                    if (createError) {
                        console.error('❌ Error creando usuario:', createError);
                    } else {
                        console.log('✅ Usuario creado exitosamente:', createdUser);
                    }
                }
            } else {
                console.log('✅ Usuario encontrado en tabla users:');
                console.log('👤 Nombre:', userData.name);
                console.log('📋 Plan:', userData.plan);
                console.log('✅ Activo:', userData.is_active);
            }
        } else {
            console.log('❌ No hay sesión activa');
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

debugCurrentAuth();
