const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fkcgndjeswbcwpsibhxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrY2duZGplc3diY3dwc2liaHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczMTE3MTEsImV4cCI6MjA0Mjg4NzcxMX0.laG7RQWN4b7xwuwFya0YBDyomqo1CFAPQN9MZh41K3c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeRealApiCall() {
    try {
        console.log('🔑 Obteniendo API keys disponibles...');
        
        // Obtener una API key válida del usuario
        const { data: apiKeys, error: apiKeysError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', '3a942f65-25e7-4de3-84cb-3df0268ff759')
            .eq('is_active', true)
            .limit(1);

        if (apiKeysError || !apiKeys || apiKeys.length === 0) {
            console.error('❌ Error obteniendo API keys:', apiKeysError);
            return;
        }

        const apiKey = apiKeys[0];
        console.log(`✅ Usando API key: ${apiKey.key_prefix}***`);

        // Insertar directamente un registro en usage_records
        console.log('📝 Creando registro de uso directo...');
        
        const usageRecord = {
            user_id: '3a942f65-25e7-4de3-84cb-3df0268ff759',
            api_key_id: apiKey.id,
            model_used: 'GPT-4o',
            cost: 0.023,
            latency_ms: 1250,
            tokens_used: 45,
            prompt_preview: '¿Cuál es la mejor manera de optimizar una consulta SQL?',
            capabilities: ['text-generation', 'analysis'],
            created_at: new Date().toISOString()
        };

        const { data: newRecord, error: insertError } = await supabase
            .from('usage_records')
            .insert([usageRecord])
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error insertando registro:', insertError);
            return;
        }

        console.log('✅ Registro creado exitosamente:');
        console.log(`   - ID: ${newRecord.id}`);
        console.log(`   - Modelo: ${newRecord.model_used}`);
        console.log(`   - Costo: $${newRecord.cost}`);
        console.log(`   - Prompt: ${newRecord.prompt_preview}`);
        console.log(`   - Fecha: ${newRecord.created_at}`);

        // También actualizar el usage_count de la API key
        const { error: updateError } = await supabase
            .from('api_keys')
            .update({ 
                usage_count: apiKey.usage_count + 1,
                last_used_at: new Date().toISOString()
            })
            .eq('id', apiKey.id);

        if (updateError) {
            console.warn('⚠️ Error actualizando usage_count:', updateError);
        } else {
            console.log('✅ Usage count actualizado');
        }

        console.log('\n🎉 ¡Listo! Ahora deberías ver este registro en el panel de administración.');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

makeRealApiCall();