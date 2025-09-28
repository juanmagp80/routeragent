const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findUserWithProPlan() {
    try {
        console.log('🔍 Buscando usuario con plan Pro...');
        
        // Buscar usuarios con plan pro
        const { data: proUsers, error: proError } = await supabase
            .from('users')
            .select('id, email, name, plan, subscription_status, subscription_current_period_end')
            .eq('plan', 'pro');

        if (proError) {
            console.error('❌ Error buscando usuarios Pro:', proError);
            return;
        }

        console.log('👥 Usuarios con plan Pro:', proUsers);

        // También buscar todos los usuarios que contengan "juan" en el email
        const { data: juanUsers, error: juanError } = await supabase
            .from('users')
            .select('id, email, name, plan, subscription_status')
            .ilike('email', '%juan%');

        if (juanError) {
            console.error('❌ Error buscando usuarios Juan:', juanError);
            return;
        }

        console.log('👤 Usuarios con "juan" en el email:', juanUsers);

        // Buscar exactamente juangpdev@gmail.com
        const { data: exactUser, error: exactError } = await supabase
            .from('users')
            .select('id, email, name, plan, subscription_status')
            .eq('email', 'juangpdev@gmail.com')
            .single();

        if (exactError) {
            console.error('⚠️ Usuario exacto juangpdev@gmail.com no encontrado:', exactError);
        } else {
            console.log('✅ Usuario exacto encontrado:', exactUser);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

findUserWithProPlan();