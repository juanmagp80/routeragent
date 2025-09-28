const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    console.error('SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserPlan() {
    try {
        console.log('🔄 Actualizando plan del usuario...');
        
        // Actualizar usuario de prueba al plan Pro
        const { data, error } = await supabase
            .from('users')
            .update({
                plan: 'pro',
                stripe_customer_id: 'cus_payment_completed',
                subscription_id: 'sub_payment_completed',
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('email', 'test@routerai.com')
            .select();

        if (error) {
            console.error('❌ Error actualizando usuario:', error);
            return;
        }

        console.log('✅ Usuario actualizado exitosamente:');
        console.log(JSON.stringify(data, null, 2));
        
        // Verificar la actualización
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('email, plan, subscription_status, updated_at')
            .eq('email', 'test@routerai.com')
            .single();
            
        if (verifyError) {
            console.error('❌ Error verificando actualización:', verifyError);
            return;
        }
        
        console.log('🔍 Estado actual del usuario:');
        console.log(JSON.stringify(verifyData, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

updateUserPlan();