const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateCorrectUserPlan() {
    try {
        console.log('🔄 Actualizando plan del usuario correcto (juangpdev@gmail.com) al plan Pro...');
        
        // Actualizar usuario correcto al plan Pro
        const { data, error } = await supabase
            .from('users')
            .update({
                plan: 'pro',
                subscription_id: 'sub_stripe_payment_completed',
                subscription_status: 'active',
                subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                updated_at: new Date().toISOString()
            })
            .eq('email', 'juangpdev@gmail.com')
            .select();

        if (error) {
            console.error('❌ Error actualizando usuario:', error);
            return;
        }

        console.log('✅ Usuario correcto actualizado exitosamente:');
        console.log(JSON.stringify(data, null, 2));
        
        // Verificar la actualización
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('email, name, plan, subscription_status, subscription_current_period_end, updated_at')
            .eq('email', 'juangpdev@gmail.com')
            .single();
            
        if (verifyError) {
            console.error('❌ Error verificando actualización:', verifyError);
            return;
        }
        
        console.log('🎉 Estado actualizado del usuario correcto:');
        console.log(JSON.stringify(verifyData, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

updateCorrectUserPlan();