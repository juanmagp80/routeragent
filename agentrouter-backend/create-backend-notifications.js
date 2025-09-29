const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNotificationsForBackend() {
    try {
        // Este es el user_id que usa el backend (según el código)
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759';
        
        console.log(`🎯 Creando notificaciones para user_id: ${userId}`);
        
        const testNotifications = [
            {
                user_id: userId,
                type: 'api_key_created',
                title: '🔑 Nueva API Key Creada',
                message: 'Se ha creado una nueva API key "Production Key" para tu cuenta',
                data: { 
                    api_key_name: 'Production Key',
                    action_url: '/admin/keys'
                }
            },
            {
                user_id: userId,
                type: 'usage_limit_warning',
                title: '⚠️ Límite de Uso Alcanzado',
                message: 'Has alcanzado el 90% de tu límite mensual de requests',
                data: { 
                    usage_percentage: 90,
                    current_usage: 9000,
                    limit: 10000,
                    action_url: '/admin/analytics'
                }
            },
            {
                user_id: userId,
                type: 'payment_failed',
                title: '💳 Pago Fallido',
                message: 'No se pudo procesar el pago de tu suscripción mensual',
                data: { 
                    amount: '$29.99',
                    next_retry: '2025-10-02',
                    action_url: '/admin/billing'
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
        
        console.log('✅ Notificaciones creadas:', data.length);
        data.forEach(n => console.log(`  📋 ${n.type}: ${n.title}`));
        
    } catch (err) {
        console.error('❌ Error general:', err.message);
    }
}

createNotificationsForBackend();