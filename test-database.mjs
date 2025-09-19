import { createClient } from '@supabase/supabase-js';

// Configuración
const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NDA3MzksImV4cCI6MjA1MDExNjczOX0.QPfTGPUPfHhHN7G3T5E8v10z9O6PTqjC5VqeFIWy9Qs';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔌 Conectando a Supabase...');

async function testDatabase() {
    try {
        // 1. Verificar conexión básica
        console.log('📋 Verificando tabla users...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, name')
            .limit(1);

        if (usersError) {
            console.error('❌ Error en tabla users:', usersError.message);
        } else {
            console.log('✅ Tabla users OK:', users?.length || 0, 'usuarios encontrados');
        }

        // 2. Verificar tabla api_keys
        console.log('🔑 Verificando tabla api_keys...');
        const { data: apiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('id, user_id, name')
            .limit(1);

        if (keysError) {
            console.error('❌ Error en tabla api_keys:', keysError.message);
        } else {
            console.log('✅ Tabla api_keys OK:', apiKeys?.length || 0, 'keys encontradas');
        }

        // 3. Verificar tabla tasks
        console.log('📝 Verificando tabla tasks...');
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id, user_id, task_type')
            .limit(1);

        if (tasksError) {
            console.error('❌ Error en tabla tasks:', tasksError.message);
        } else {
            console.log('✅ Tabla tasks OK:', tasks?.length || 0, 'tasks encontradas');
        }

        // 4. Verificar tabla usage_records
        console.log('📊 Verificando tabla usage_records...');
        const { data: records, error: recordsError } = await supabase
            .from('usage_records')
            .select('id, user_id, model_used')
            .limit(1);

        if (recordsError) {
            console.error('❌ Error en tabla usage_records:', recordsError.message);
        } else {
            console.log('✅ Tabla usage_records OK:', records?.length || 0, 'records encontrados');
        }

        // 5. Crear SQL para tablas faltantes
        const tablesToCreate = [];
        
        if (keysError && keysError.message.includes('does not exist')) {
            tablesToCreate.push('api_keys');
        }
        if (tasksError && tasksError.message.includes('does not exist')) {
            tablesToCreate.push('tasks');
        }
        if (recordsError && recordsError.message.includes('does not exist')) {
            tablesToCreate.push('usage_records');
        }

        if (tablesToCreate.length > 0) {
            console.log('\n🔧 Tablas que necesitan ser creadas:', tablesToCreate.join(', '));
            console.log('📋 Ve a Supabase SQL Editor y ejecuta CREATE_METRICS_TABLES.sql');
        } else {
            console.log('\n✅ Todas las tablas están disponibles!');
        }

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

testDatabase();
