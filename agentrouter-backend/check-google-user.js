const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGoogleUser() {
    try {
        console.log('🔍 Verificando usuario de Google...');
        
        // Buscar el usuario en auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Error obteniendo usuarios auth:', authError);
            return;
        }

        console.log('👥 Usuarios en auth.users:');
        authUsers.users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Provider: ${user.app_metadata?.provider || 'email'}`);
            console.log(`   Email confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
            console.log(`   Creado: ${user.created_at}`);
            console.log('---');
        });

        // Buscar usuarios en la tabla users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.error('❌ Error obteniendo usuarios tabla users:', usersError);
            return;
        }

        console.log('\n📋 Usuarios en tabla users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Plan: ${user.plan}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Creado: ${user.created_at}`);
            console.log('---');
        });

        // Buscar específicamente juanmagpdevv@gmail.com
        const targetEmail = 'juanmagpdevv@gmail.com';
        const authUser = authUsers.users.find(u => u.email === targetEmail);
        const dbUser = users.find(u => u.email === targetEmail);

        console.log(`\n🎯 Verificando usuario específico: ${targetEmail}`);
        console.log('En auth.users:', authUser ? '✅ Encontrado' : '❌ No encontrado');
        console.log('En tabla users:', dbUser ? '✅ Encontrado' : '❌ No encontrado');

        if (authUser && !dbUser) {
            console.log('⚠️ Usuario existe en auth pero no en tabla users - necesita sincronización');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkGoogleUser();
