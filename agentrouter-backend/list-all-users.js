const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllUsers() {
    try {
        console.log('🔍 Listando todos los usuarios en la base de datos...');
        
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, plan, subscription_status')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log('👥 Usuarios encontrados:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Plan: ${user.plan}`);
            console.log(`   Status: ${user.subscription_status}`);
            console.log(`   ID: ${user.id}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

listAllUsers();