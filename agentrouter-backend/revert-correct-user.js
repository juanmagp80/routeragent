const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function revertCorrectUser() {
  try {
    console.log('🔄 Revirtiendo usuario juanmagp26@gmail.com al plan Free...');
    
    const { data, error } = await supabase
      .from('users')
      .update({
        plan: 'free',
        subscription_id: null,
        subscription_status: null,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'juanmagp26@gmail.com')
      .select();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Usuario revertido a FREE exitosamente:');
    console.log('📧 Email:', data[0].email);
    console.log('📋 Plan:', data[0].plan);
    console.log('🔗 Subscription ID:', data[0].subscription_id);
    console.log('📊 Subscription Status:', data[0].subscription_status);
    console.log('📅 Updated At:', data[0].updated_at);
    
    console.log('\n🎯 ¡Listo! Ahora puedes hacer un pago de prueba para probar el webhook automático.');

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

revertCorrectUser();