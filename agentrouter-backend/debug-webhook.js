const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Configuración:');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service Key disponible:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function simulateWebhookUpdate(plan, billingInfo) {
  try {
    console.log(`\n🎯 Simulando actualización a plan: ${plan}`);
    console.log('💳 Billing info:', JSON.stringify(billingInfo, null, 2));

    console.log('\n📝 Ejecutando actualización en Supabase...');
    const { data, error } = await supabase
      .from('users')
      .update({
        plan: plan,
        subscription_id: billingInfo.subscriptionId,
        subscription_status: billingInfo.status,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'juanmagp26@gmail.com')
      .select();

    if (error) {
      console.error('❌ Error en actualización:', error);
      
      // Intentar fallback
      console.log('\n🔄 Probando fallback con is_active=true...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('users')
        .update({
          plan: plan,
          subscription_id: billingInfo.subscriptionId,
          subscription_status: billingInfo.status,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true)
        .limit(1)
        .select();

      if (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return false;
      }
      
      console.log('✅ Actualización exitosa via fallback:', fallbackData);
      return true;
    }

    console.log('✅ Actualización exitosa:', data);
    return true;

  } catch (error) {
    console.error('❌ Exception:', error);
    return false;
  }
}

// Simular el webhook
const billingInfo = {
  customerId: 'cus_debug_test',
  subscriptionId: 'sub_debug_enterprise',
  status: 'active'
};

simulateWebhookUpdate('enterprise', billingInfo).then(success => {
  console.log(`\n${success ? '✅' : '❌'} Simulación completada:`, success ? 'ÉXITO' : 'FALLO');
});