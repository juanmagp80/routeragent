const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    try {
        console.log('🔍 Verificando estructura de la tabla users...');
        
        // Obtener un usuario existente para ver la estructura
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('📋 Estructura de la tabla users:');
            console.log('Columnas disponibles:', Object.keys(data[0]));
            console.log('Datos del primer usuario:');
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log('⚠️ No hay usuarios en la tabla');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkSchema();