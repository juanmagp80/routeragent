const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function revertToFreeForTesting() {
    try {
        console.log('🔄 Revirtiendo usuario al plan Free para probar webhook automático...');
        
        // Revertir usuario a plan Free para testing
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

        console.log('✅ Usuario revertido a FREE exitosamente:');
        console.log(JSON.stringify(data, null, 2));
        
        // Verificar la reversión
        const { data: verifyData, error: verifyError } = await supabase
            .from('users')
            .select('email, name, plan, subscription_status, subscription_id')
            .eq('email', 'juangpdev@gmail.com')
            .single();
            
        if (verifyError) {
            console.error('❌ Error verificando reversión:', verifyError);
            return;
        }
        
        console.log('📋 Estado actual del usuario:');
        console.log(JSON.stringify(verifyData, null, 2));
        
        console.log('🎯 ¡Listo! Ahora puedes hacer un pago de prueba para probar el webhook automático.');
        console.log('📱 El webhook mejorado con logging debería procesarlo automáticamente.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

revertToFreeForTesting();