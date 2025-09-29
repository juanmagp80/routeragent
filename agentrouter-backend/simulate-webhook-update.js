const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function simulateWebhookUpdate() {
  try {
    console.log('🧪 Simulando actualización de webhook...');
    console.log('📧 Actualizando usuario: juanmagp26@gmail.com');
    console.log('📋 Nuevo plan: pro');
    
    const { data, error } = await supabase
      .from('users')
      .update({
        plan: 'pro',
        subscription_id: 'sub_test_12345',
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'juanmagp26@gmail.com')
      .select();

    if (error) {
      console.error('❌ Error actualizando usuario:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.error('❌ No se encontró usuario para actualizar');
      return;
    }

    console.log('✅ Usuario actualizado exitosamente:');
    console.log(JSON.stringify(data[0], null, 2));

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

simulateWebhookUpdate();