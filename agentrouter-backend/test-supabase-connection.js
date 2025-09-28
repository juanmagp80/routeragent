const { createClient } = require('@supabase/supabase-js');

// Usar las mismas variables que usa el webhook
const supabaseUrl = process.env.SUPABASE_URL || 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando conexión a Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service Key disponible:', !!supabaseServiceKey);
console.log('🔑 Service Key longitud:', supabaseServiceKey ? supabaseServiceKey.length : 'undefined');

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('🧪 Probando consulta básica...');
    const { data, error } = await supabase
      .from('users')
      .select('id, email, plan')
      .limit(1);

    if (error) {
      console.error('❌ Error en consulta:', error);
      return false;
    }

    console.log('✅ Conexión exitosa. Datos de ejemplo:', data);
    return true;
  } catch (err) {
    console.error('❌ Error de conexión:', err);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase funciona correctamente');
  } else {
    console.log('💥 Problema con Supabase');
    process.exit(1);
  }
});