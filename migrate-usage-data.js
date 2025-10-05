const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase desde las variables de entorno del backend
const supabaseUrl = 'https://fkcgndjeswbcwpsibhxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrY2duZGplc3diY3dwc2liaHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczMTE3MTEsImV4cCI6MjA0Mjg4NzcxMX0.laG7RQWN4b7xwuwFya0YBDyomqo1CFAPQN9MZh41K3c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateUsageData() {
    try {
        console.log('🔄 Migrando datos de usage_logs a usage_records...');

        // Obtener las API keys del usuario para asociar los registros
        const { data: apiKeys, error: apiKeysError } = await supabase
            .from('api_keys')
            .select('id, user_id')
            .eq('user_id', '3a942f65-25e7-4de3-84cb-3df0268ff759')
            .eq('is_active', true);

        if (apiKeysError) {
            console.error('Error obteniendo API keys:', apiKeysError);
            return;
        }

        if (!apiKeys || apiKeys.length === 0) {
            console.log('No se encontraron API keys activas');
            return;
        }

        const firstApiKey = apiKeys[0];
        console.log(`📋 Usando API key: ${firstApiKey.id}`);

        // Obtener todos los registros de usage_logs
        const { data: usageLogs, error: logsError } = await supabase
            .from('usage_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50); // Últimos 50 registros

        if (logsError) {
            console.error('Error obteniendo usage_logs:', logsError);
            return;
        }

        if (!usageLogs || usageLogs.length === 0) {
            console.log('No se encontraron registros en usage_logs');
            return;
        }

        console.log(`📊 Encontrados ${usageLogs.length} registros en usage_logs`);

        // Convertir los registros para usage_records
        const recordsToMigrate = usageLogs.map(log => ({
            user_id: log.user_id || firstApiKey.user_id,
            api_key_id: log.api_key_id || firstApiKey.id,
            model_used: log.model_used,
            cost: log.cost,
            latency_ms: log.latency_ms,
            tokens_used: log.tokens_used,
            prompt_preview: log.prompt_preview,
            capabilities: log.capabilities,
            created_at: log.created_at
        }));

        // Insertar en usage_records
        const { data: insertedRecords, error: insertError } = await supabase
            .from('usage_records')
            .insert(recordsToMigrate)
            .select();

        if (insertError) {
            console.error('Error insertando en usage_records:', insertError);
            return;
        }

        console.log(`✅ Migrados ${insertedRecords.length} registros a usage_records`);

        // Mostrar algunos ejemplos
        console.log('\n📋 Ejemplos de registros migrados:');
        insertedRecords.slice(0, 3).forEach((record, index) => {
            console.log(`${index + 1}. Modelo: ${record.model_used}, Costo: $${record.cost}, Fecha: ${record.created_at}`);
        });

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    }
}

migrateUsageData();