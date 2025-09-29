const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulateUsageLimit() {
    try {
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759';
        
        console.log('🔄 Obteniendo claves activas del usuario...');
        
        // Obtener todas las claves activas del usuario
        const { data: keys, error: fetchError } = await supabase
            .from('api_keys')
            .select('id, name, usage_count')
            .eq('user_id', userId)
            .eq('is_active', true);
            
        if (fetchError) {
            console.error('❌ Error al obtener claves:', fetchError);
            return;
        }
        
        console.log(`✅ Encontradas ${keys.length} claves activas:`);
        keys.forEach(key => {
            console.log(`  - ${key.name}: ${key.usage_count} requests usados`);
        });
        
        // Distribuyamos el uso entre las claves para llegar a 4997 total
        const totalRequestsToSimulate = 4997; // Quedan 3 requests de 5000
        const requestsPerKey = Math.floor(totalRequestsToSimulate / keys.length);
        const remainingRequests = totalRequestsToSimulate % keys.length;
        
        console.log(`\n🎯 Simulando ${totalRequestsToSimulate} requests usados total:`);
        
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const requestsForThisKey = requestsPerKey + (i < remainingRequests ? 1 : 0);
            
            const { error: updateError } = await supabase
                .from('api_keys')
                .update({ usage_count: requestsForThisKey })
                .eq('id', key.id);
                
            if (updateError) {
                console.error(`❌ Error actualizando ${key.name}:`, updateError);
            } else {
                console.log(`✅ ${key.name}: ${requestsForThisKey} requests`);
            }
        }
        
        // Verificar el resultado
        console.log('\n🔍 Verificando el resultado...');
        const { data: updatedKeys, error: verifyError } = await supabase
            .from('api_keys')
            .select('name, usage_count')
            .eq('user_id', userId)
            .eq('is_active', true);
            
        if (verifyError) {
            console.error('❌ Error verificando:', verifyError);
            return;
        }
        
        const totalUsage = updatedKeys.reduce((sum, key) => sum + key.usage_count, 0);
        console.log(`\n📊 Resumen final:`);
        console.log(`  Total de requests usados: ${totalUsage}/5000`);
        console.log(`  Requests restantes: ${5000 - totalUsage}`);
        
        updatedKeys.forEach(key => {
            console.log(`  - ${key.name}: ${key.usage_count} requests`);
        });
        
        console.log('\n🚀 ¡Listo! Ahora el usuario está cerca del límite.');
        
    } catch (err) {
        console.error('❌ Error general:', err.message);
    }
}

simulateUsageLimit();