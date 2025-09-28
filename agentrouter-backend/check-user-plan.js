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

async function checkUserPlan() {
  try {
    console.log('🔍 Verificando plan del usuario juanmagp26@gmail.com...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, plan, subscription_id, subscription_status, updated_at')
      .eq('email', 'juanmagp26@gmail.com')
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!data) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('📧 Email:', data.email);
    console.log('📋 Plan:', data.plan);
    console.log('🔗 Subscription ID:', data.subscription_id);
    console.log('📊 Subscription Status:', data.subscription_status);
    console.log('📅 Última actualización:', data.updated_at);

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkUserPlan();