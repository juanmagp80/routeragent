// Script para verificar y crear notificaciones de prueba
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserAndCreateNotification() {
    try {
        console.log('🔍 Verificando usuarios existentes...');

        // Listar todos los usuarios
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, name')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.error('❌ Error getting users:', usersError);
            return;
        }

        console.log('👥 Usuarios encontrados:');
        users.forEach(user => {
            console.log(`  - ID: ${user.id}`);
            console.log(`    Email: ${user.email}`);
            console.log(`    Nombre: ${user.name}`);
            console.log('');
        });

        if (users.length === 0) {
            console.log('⚠️ No se encontraron usuarios');
            return;
        }

        // Usar el primer usuario (más reciente) para crear notificación de prueba
        const currentUser = users[0];
        console.log(`🎯 Creando notificación de prueba para: ${currentUser.name} (${currentUser.email})`);

        // Crear notificación de prueba
        const testNotification = {
            user_id: currentUser.id,
            type: 'welcome',
            title: '🎉 ¡Notificación de Prueba!',
            message: `Hola ${currentUser.name}, esta es una notificación de prueba para verificar que el sistema funciona correctamente. Fecha: ${new Date().toLocaleString('es-ES')}`,
            data: {
                test: true,
                timestamp: new Date().toISOString(),
                action_url: '/admin/notifications'
            },
            is_read: false
        };

        const { data: newNotification, error: notificationError } = await supabase
            .from('notifications')
            .insert([testNotification])
            .select()
            .single();

        if (notificationError) {
            console.error('❌ Error creating test notification:', notificationError);
            return;
        }

        console.log('✅ Notificación de prueba creada exitosamente:');
        console.log(`   ID: ${newNotification.id}`);
        console.log(`   Título: ${newNotification.title}`);
        console.log(`   Para usuario: ${currentUser.email}`);

        // Verificar notificaciones existentes para este usuario
        const { data: existingNotifications, error: existingError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (existingError) {
            console.error('❌ Error getting existing notifications:', existingError);
            return;
        }

        console.log(`📬 Últimas 5 notificaciones para ${currentUser.email}:`);
        existingNotifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. ${notif.title} (${notif.is_read ? '✓ leída' : '○ sin leer'})`);
            console.log(`      Fecha: ${new Date(notif.created_at).toLocaleString('es-ES')}`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

checkUserAndCreateNotification();
