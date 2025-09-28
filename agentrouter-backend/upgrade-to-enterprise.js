const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeToEnterprise() {
    try {
        console.log('🚀 Actualizando usuario a Plan Enterprise...');
        
        // Actualizar directamente a Plan Enterprise
        const { data, error } = await supabase
            .from('users')
            .update({
                plan: 'enterprise',
                subscription_id: 'sub_enterprise_upgrade',
                subscription_status: 'active',
                subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('email', 'juangpdev@gmail.com')
            .select();

        if (error) {
            console.error('❌ Error actualizando usuario:', error);
            return;
        }

        console.log('🎉 ¡Usuario actualizado a Enterprise exitosamente!');
        console.log(JSON.stringify(data, null, 2));
        
        // Verificar la actualización
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('email, name, plan, subscription_status, subscription_current_period_end')
            .eq('email', 'juangpdev@gmail.com')
            .single();
            
        console.log('🏢 Estado actualizado del usuario:');
        console.log(JSON.stringify(verifyData, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

upgradeToEnterprise();