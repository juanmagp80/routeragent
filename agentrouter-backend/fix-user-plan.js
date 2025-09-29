const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserPlan() {
    try {
        console.log('🔍 Verificando usuario en la tabla users...');
        
        // Buscar usuario por email
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'juanmagp26@gmail.com');

        if (userError) {
            console.error('❌ Error buscando usuario:', userError);
            return;
        }

        if (!users || users.length === 0) {
            console.log('❌ Usuario no encontrado en la tabla users');
            console.log('🔧 Creando usuario con plan Pro...');
            
            // Crear usuario con plan Pro
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([
                    {
                        id: crypto.randomUUID(),
                        email: 'juanmagp26@gmail.com',
                        name: 'Juan Manuel Garrido',
                        plan: 'pro',
                        subscription_status: 'active',
                        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: new Date().toISOString()
                    }
                ])
                .select();
                
            if (createError) {
                console.error('❌ Error creando usuario:', createError);
                return;
            }
            
            console.log('✅ Usuario creado:', newUser);
        } else {
            console.log('✅ Usuario encontrado:', users[0]);
            
            // Si el usuario existe pero no tiene plan Pro, actualizarlo
            if (users[0].plan !== 'pro') {
                console.log('🔧 Actualizando plan a Pro...');
                
                const { data: updatedUser, error: updateError } = await supabase
                    .from('users')
                    .update({
                        plan: 'pro',
                        subscription_status: 'active',
                        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .eq('email', 'juanmagp26@gmail.com')
                    .select();
                    
                if (updateError) {
                    console.error('❌ Error actualizando usuario:', updateError);
                    return;
                }
                
                console.log('✅ Usuario actualizado:', updatedUser);
            } else {
                console.log('✅ El usuario ya tiene plan Pro');
            }
        }
        
    } catch (err) {
        console.error('❌ Error general:', err.message);
    }
}

checkUserPlan();