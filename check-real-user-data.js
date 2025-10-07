const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRealUserData() {
    try {
        console.log('🔍 === VERIFICANDO DATOS REALES DEL USUARIO ===');
        
        // Primero, encontrar el usuario actual
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Error obteniendo usuarios auth:', authError);
            return;
        }

        // Buscar el usuario de Google
        const googleUser = authUsers.users.find(u => u.email === 'juanmagpdevv@gmail.com');
        
        if (!googleUser) {
            console.log('❌ Usuario de Google no encontrado');
            return;
        }

        console.log('✅ Usuario encontrado:', googleUser.email, 'ID:', googleUser.id);

        // Verificar datos en tabla users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', googleUser.id)
            .single();

        if (userError) {
            console.error('❌ Error obteniendo datos de usuario:', userError);
        } else {
            console.log('👤 Datos del usuario:', {
                name: userData.name,
                email: userData.email,
                plan: userData.plan,
                api_key_limit: userData.api_key_limit,
                created_at: userData.created_at
            });
        }

        // Verificar API keys reales
        const { data: apiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', googleUser.id);

        if (keysError) {
            console.error('❌ Error obteniendo API keys:', keysError);
        } else {
            console.log('🔑 API Keys encontradas:', apiKeys.length);
            apiKeys.forEach((key, index) => {
                console.log(`  ${index + 1}. ${key.name} - Activa: ${key.is_active} - Uso: ${key.usage_count || 0}`);
            });
        }

        // Verificar tasks reales
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', googleUser.id)
            .order('created_at', { ascending: false });

        if (tasksError) {
            console.error('❌ Error obteniendo tasks (puede que la tabla no exista):', tasksError);
        } else {
            console.log('📋 Tasks encontradas:', tasks.length);
            tasks.slice(0, 3).forEach((task, index) => {
                console.log(`  ${index + 1}. ${task.task_type || 'N/A'} - Modelo: ${task.model_selected || 'N/A'} - Costo: $${task.cost || 0}`);
            });
        }

        // Verificar usage_records reales
        const { data: usageRecords, error: recordsError } = await supabase
            .from('usage_records')
            .select('*')
            .eq('user_id', googleUser.id)
            .order('created_at', { ascending: false });

        if (recordsError) {
            console.error('❌ Error obteniendo usage_records (puede que la tabla no exista):', recordsError);
        } else {
            console.log('📊 Usage records encontrados:', usageRecords.length);
            usageRecords.slice(0, 3).forEach((record, index) => {
                console.log(`  ${index + 1}. Modelo: ${record.model_used || 'N/A'} - Costo: $${record.cost || 0}`);
            });
        }

        // Verificar usage_logs reales
        const { data: usageLogs, error: logsError } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', googleUser.id)
            .order('created_at', { ascending: false });

        if (logsError) {
            console.error('❌ Error obteniendo usage_logs (puede que la tabla no exista):', logsError);
        } else {
            console.log('📝 Usage logs encontrados:', usageLogs.length);
            usageLogs.slice(0, 3).forEach((log, index) => {
                console.log(`  ${index + 1}. Modelo: ${log.model_used || 'N/A'} - Costo: $${log.cost || 0}`);
            });
        }

        // Resumen final
        console.log('\n📋 === RESUMEN DE DATOS REALES ===');
        console.log('API Keys:', apiKeys?.length || 0);
        console.log('Tasks:', tasks?.length || 0);
        console.log('Usage Records:', usageRecords?.length || 0);
        console.log('Usage Logs:', usageLogs?.length || 0);

        // Total de requests reales
        const totalRequests = (tasks?.length || 0) + (usageRecords?.length || 0) + (usageLogs?.length || 0);
        console.log('Total requests calculado:', totalRequests);

        // Total de costo real
        const totalCostFromTasks = tasks?.reduce((sum, task) => sum + parseFloat(task.cost || '0'), 0) || 0;
        const totalCostFromRecords = usageRecords?.reduce((sum, record) => sum + parseFloat(record.cost || '0'), 0) || 0;
        const totalCostFromLogs = usageLogs?.reduce((sum, log) => sum + parseFloat(log.cost || '0'), 0) || 0;
        const totalCost = totalCostFromTasks + totalCostFromRecords + totalCostFromLogs;
        console.log('Costo total calculado: $', totalCost.toFixed(4));

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

checkRealUserData();
