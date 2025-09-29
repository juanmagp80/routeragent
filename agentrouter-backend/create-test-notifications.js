const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestNotifications() {
    try {
        console.log('🧪 Creando notificaciones de prueba...');

        const testNotifications = [
            {
                user_id: '12345678-1234-1234-1234-123456789001',
                type: 'api_key_created',
                title: 'Nueva API Key Creada',
                message: 'Se ha creado una nueva API key "Production Key" para tu cuenta',
                data: {
                    api_key_name: 'Production Key',
                    action_url: '/admin/keys'
                }
            },
            {
                user_id: '12345678-1234-1234-1234-123456789001',
                type: 'usage_limit_warning',
                title: 'Límite de Uso Alcanzado',
                message: 'Has alcanzado el 90% de tu límite mensual de requests',
                data: {
                    usage_percentage: 90,
                    current_usage: 9000,
                    limit: 10000,
                    action_url: '/admin/analytics'
                }
            },
            {
                user_id: '12345678-1234-1234-1234-123456789001',
                type: 'payment_failed',
                title: 'Pago Fallido',
                message: 'No se pudo procesar el pago de tu suscripción mensual',
                data: {
                    amount: '$29.99',
                    next_retry: '2025-10-02',
                    action_url: '/admin/billing'
                }
            },
            {
                user_id: '12345678-1234-1234-1234-123456789001',
                type: 'security_alert',
                title: 'Actividad Sospechosa',
                message: 'Se detectó acceso desde una nueva ubicación: Madrid, España',
                data: {
                    location: 'Madrid, España',
                    ip: '192.168.1.100',
                    timestamp: new Date().toISOString(),
                    action_url: '/admin/settings'
                }
            },
            {
                user_id: '12345678-1234-1234-1234-123456789001',
                type: 'system_maintenance',
                title: 'Mantenimiento Programado',
                message: 'Habrá mantenimiento del sistema el 30 de septiembre de 2:00 AM a 4:00 AM UTC',
                data: {
                    start_time: '2025-09-30T02:00:00Z',
                    end_time: '2025-09-30T04:00:00Z',
                    affected_services: ['API', 'Dashboard'],
                    action_url: '/admin/notifications'
                }
            }
        ];

        const { data, error } = await supabase
            .from('notifications')
            .insert(testNotifications)
            .select();

        if (error) {
            console.error('❌ Error al crear notificaciones:', error);
            return;
        }

        console.log('✅ Notificaciones de prueba creadas:', data.length);
        console.log('📋 Tipos creados:', data.map(n => `${n.type}: ${n.title}`));

        // Verificar que se crearon correctamente
        const { data: allNotifications, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', '12345678-1234-1234-1234-123456789001')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('❌ Error al obtener notificaciones:', fetchError);
            return;
        }

        console.log(`\n📊 Total de notificaciones en BD: ${allNotifications.length}`);
        console.log('🔄 No leídas:', allNotifications.filter(n => !n.is_read).length);
        console.log('✅ Leídas:', allNotifications.filter(n => n.is_read).length);

    } catch (err) {
        console.error('❌ Error general:', err.message);
    }
}

createTestNotifications();