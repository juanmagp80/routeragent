const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function revertUserToFree() {
    try {
        console.log('🔄 Revirtiendo usuario a plan Free para probar el flujo completo...');
        
        // Revertir usuario a plan Free
        const { data, error } = await supabase
            .from('users')
            .update({
                plan: 'free',
                subscription_id: null,
                subscription_status: null,
                subscription_current_period_end: null,
                updated_at: new Date().toISOString()
            })
            .eq('email', 'juangpdev@gmail.com')
            .select();

        if (error) {
            console.error('❌ Error revirtiendo usuario:', error);
            return;
        }

        console.log('✅ Usuario revertido a FREE:');
        console.log(JSON.stringify(data, null, 2));
        
        console.log('🎯 Ahora puedes hacer un pago de prueba para probar el webhook automático');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

revertUserToFree();