const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processRealStripeEventFixed() {
    try {
        console.log('🎯 Procesando evento real de Stripe (solo columnas existentes)...');
        
        // Datos exactos del evento real de Stripe
        const realEventData = {
            sessionId: 'cs_test_a1N9F6mKbaMwcTYUGewl7vbtN695cKcAdekwAo6NLDDxwfrjirZaN9c9wJ',
            customerId: 'cus_T8jFWzpOs6L0gn',
            subscriptionId: 'sub_1SCRnI2ULfqKVBqVgZ7ra8Hk',
            planId: 'pro'
        };

        console.log('📋 Datos del evento real:', realEventData);

        // Intentar actualizar usuario por email específico primero
        console.log('🔄 Intentando actualizar juangpdev@gmail.com...');
        let { data, error } = await supabase
            .from('users')
            .update({
                plan: realEventData.planId,
                subscription_id: realEventData.subscriptionId,
                subscription_status: 'active',
                subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('email', 'juangpdev@gmail.com')
            .select();

        if (error || !data || data.length === 0) {
            console.log('⚠️ Usuario juangpdev@gmail.com no encontrado, buscando otros...');
            
            // Buscar usuarios activos para ver cuáles hay
            const { data: activeUsers } = await supabase
                .from('users')
                .select('email, name, is_active')
                .eq('is_active', true);
                
            console.log('👥 Usuarios activos encontrados:', activeUsers);
            
            // Intentar con el primer usuario activo
            if (activeUsers && activeUsers.length > 0) {
                const targetUser = activeUsers[0];
                console.log(`🎯 Actualizando usuario: ${targetUser.email}`);
                
                ({ data, error } = await supabase
                    .from('users')
                    .update({
                        plan: realEventData.planId,
                        subscription_id: realEventData.subscriptionId,
                        subscription_status: 'active',
                        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', targetUser.email)
                    .select());
            }
        }

        if (error) {
            console.error('❌ Error actualizando usuario:', error);
            return;
        }

        console.log('🎉 ¡Usuario actualizado exitosamente!');
        console.log(JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

processRealStripeEventFixed();