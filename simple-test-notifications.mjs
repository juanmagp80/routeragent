// Script simple para verificar notificaciones
console.log('🚀 Iniciando verificación de notificaciones...');

const fetch = globalThis.fetch;

async function testNotifications() {
    try {
        console.log('📡 Conectando a Supabase...');

        const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

        // Verificar usuarios
        const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=id,email,name&order=created_at.desc&limit=3`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!usersResponse.ok) {
            throw new Error(`Error getting users: ${usersResponse.status}`);
        }

        const users = await usersResponse.json();
        console.log('👥 Usuarios encontrados:', users.length);

        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name || 'Sin nombre'} (${user.email})`);
            console.log(`     ID: ${user.id}`);
        });

        if (users.length === 0) {
            console.log('⚠️ No hay usuarios registrados');
            return;
        }

        const currentUser = users[0];
        console.log(`\n🎯 Verificando notificaciones para: ${currentUser.email}`);

        // Verificar notificaciones existentes
        const notificationsResponse = await fetch(`${supabaseUrl}/rest/v1/notifications?user_id=eq.${currentUser.id}&order=created_at.desc&limit=5&select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!notificationsResponse.ok) {
            throw new Error(`Error getting notifications: ${notificationsResponse.status}`);
        }

        const notifications = await notificationsResponse.json();
        console.log(`📬 Notificaciones encontradas: ${notifications.length}`);

        notifications.forEach((notif, index) => {
            console.log(`  ${index + 1}. ${notif.title}`);
            console.log(`     Tipo: ${notif.type} | Leída: ${notif.is_read ? '✓' : '○'}`);
            console.log(`     Fecha: ${new Date(notif.created_at).toLocaleString('es-ES')}`);
        });

        // Crear notificación de prueba
        console.log('\n🆕 Creando notificación de prueba...');

        const testNotification = {
            user_id: currentUser.id,
            type: 'test',
            title: '🧪 Notificación de Prueba - Funcionalidad',
            message: `Hola ${currentUser.name || currentUser.email}, esta notificación fue creada para probar la funcionalidad. Todo parece estar funcionando correctamente. Timestamp: ${new Date().toLocaleString('es-ES')}`,
            data: {
                test: true,
                created_by: 'test-script',
                timestamp: new Date().toISOString()
            },
            is_read: false
        };

        const createResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testNotification)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Error creating notification: ${createResponse.status} - ${errorText}`);
        }

        const newNotification = await createResponse.json();
        console.log('✅ Notificación creada exitosamente:');
        console.log(`   ID: ${newNotification[0].id}`);
        console.log(`   Título: ${newNotification[0].title}`);

        console.log('\n🎉 ¡Proceso completado! Verifica la página de notificaciones en el navegador.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testNotifications();
