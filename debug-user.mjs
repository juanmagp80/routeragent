// Script para verificar el usuario actual
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUser() {
    const targetUserId = '761ce82d-0f07-4f70-9b63-987a668b0907';
    
    try {
        console.log('🔍 Buscando usuario:', targetUserId);
        
        // Verificar si el usuario existe
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', targetUserId)
            .single();

        if (userError) {
            console.error('❌ Error buscando usuario:', userError);
            return;
        }

        if (!user) {
            console.log('❌ Usuario no encontrado');
            return;
        }

        console.log('✅ Usuario encontrado:', {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at
        });

        // Verificar notificaciones para este usuario
        const { data: notifications, error: notificationsError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

        if (notificationsError) {
            console.error('❌ Error buscando notificaciones:', notificationsError);
            return;
        }

        console.log(`📬 Notificaciones encontradas: ${notifications.length}`);
        
        if (notifications.length > 0) {
            console.log('📝 Últimas notificaciones:');
            notifications.slice(0, 3).forEach((notif, index) => {
                console.log(`  ${index + 1}. ${notif.title} (${notif.is_read ? '✓ leída' : '○ sin leer'})`);
                console.log(`     ID: ${notif.id}`);
                console.log(`     Fecha: ${notif.created_at}`);
                console.log('');
            });
        } else {
            console.log('📭 No hay notificaciones para este usuario');
            
            // Crear una notificación de prueba
            console.log('🔧 Creando notificación de prueba...');
            
            const testNotification = {
                user_id: targetUserId,
                type: 'info',
                title: '🧪 Notificación de Debug',
                message: 'Esta es una notificación creada desde el script de debug para verificar que el sistema funciona.',
                data: {
                    debug: true,
                    timestamp: new Date().toISOString(),
                    source: 'debug-script'
                },
                is_read: false
            };

            const { data: newNotif, error: createError } = await supabase
                .from('notifications')
                .insert([testNotification])
                .select()
                .single();

            if (createError) {
                console.error('❌ Error creando notificación de debug:', createError);
            } else {
                console.log('✅ Notificación de debug creada:', newNotif.id);
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

debugUser();
