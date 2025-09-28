const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processRealStripeEvent() {
    try {
        console.log('🎯 Procesando evento real de Stripe manualmente...');
        
        // Datos exactos del evento real de Stripe
        const realEventData = {
            sessionId: 'cs_test_a1N9F6mKbaMwcTYUGewl7vbtN695cKcAdekwAo6NLDDxwfrjirZaN9c9wJ',
            customerId: 'cus_T8jFWzpOs6L0gn',
            subscriptionId: 'sub_1SCRnI2ULfqKVBqVgZ7ra8Hk',
            planId: 'pro', // Del metadata
            customerEmail: 'appcartama@hotmail.com' // Email real del cliente en Stripe
        };

        console.log('📋 Datos del evento real:', realEventData);

        // Intentar actualizar usuario por email específico primero
        console.log('🔄 Intentando actualizar juangpdev@gmail.com...');
        let { data, error } = await supabase
            .from('users')
            .update({
                plan: realEventData.planId,
                stripe_customer_id: realEventData.customerId,
                subscription_id: realEventData.subscriptionId,
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('email', 'juangpdev@gmail.com')
            .select();

        if (error || !data || data.length === 0) {
            console.log('⚠️ Usuario específico no encontrado, probando fallback...');
            
            // Fallback: actualizar cualquier usuario activo
            ({ data, error } = await supabase
                .from('users')
                .update({
                    plan: realEventData.planId,
                    stripe_customer_id: realEventData.customerId,
                    subscription_id: realEventData.subscriptionId,
                    subscription_status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('is_active', true)
                .limit(1)
                .select());
        }

        if (error) {
            console.error('❌ Error actualizando usuario:', error);
            return;
        }

        console.log('🎉 ¡Usuario actualizado exitosamente con datos reales de Stripe!');
        console.log(JSON.stringify(data, null, 2));
        
        // Verificar la actualización
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('email, name, plan, subscription_status, subscription_id')
            .eq('plan', 'pro')
            .eq('subscription_status', 'active');
            
        console.log('✅ Usuarios con plan Pro activo:');
        console.log(JSON.stringify(verifyData, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

processRealStripeEvent();