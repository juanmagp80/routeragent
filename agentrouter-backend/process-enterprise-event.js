const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processRealEnterpriseEvent() {
    try {
        console.log('🏢 Procesando evento REAL de Stripe Enterprise...');
        
        // Datos exactos del evento Enterprise real
        const enterpriseEventData = {
            sessionId: 'cs_test_a137HEnsMN4It39jtnSptDEOvoUY4jpDm3TW9d0o8Qig6JhclOy1Jyjati',
            customerId: 'cus_T8jUVm9wltzh6g',
            subscriptionId: 'sub_1SCS1y2ULfqKVBqVmgGM1aGv',
            planId: 'enterprise', // Del metadata
            customerEmail: 'juangpdev@gmail.com' // Email real en Stripe
        };

        console.log('📋 Datos del evento Enterprise:', enterpriseEventData);

        // Actualizar usuario a Enterprise
        console.log('🔄 Actualizando usuario a Plan Enterprise...');
        let { data, error } = await supabase
            .from('users')
            .update({
                plan: enterpriseEventData.planId,
                subscription_id: enterpriseEventData.subscriptionId,
                subscription_status: 'active',
                subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('email', 'juangpdev@gmail.com')
            .select();

        if (error || !data || data.length === 0) {
            console.log('⚠️ Usuario juangpdev@gmail.com no encontrado, verificando usuarios...');
            
            // Buscar usuarios para diagnóstico
            const { data: allUsers } = await supabase
                .from('users')
                .select('email, name, is_active, plan');
                
            console.log('👥 Usuarios en base de datos:', allUsers);
            return;
        }

        console.log('🎉 ¡Usuario actualizado a Enterprise exitosamente!');
        console.log(JSON.stringify(data, null, 2));
        
        // Verificar la actualización
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('email, name, plan, subscription_status, subscription_id')
            .eq('plan', 'enterprise')
            .eq('subscription_status', 'active');
            
        console.log('🏢 Usuarios con Plan Enterprise activo:');
        console.log(JSON.stringify(verifyData, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

processRealEnterpriseEvent();