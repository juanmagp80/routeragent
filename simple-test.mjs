// Script simple para probar login
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjQyMTksImV4cCI6MjA3MzYwMDIxOX0._2aqWnPZlUGTIz-8INCWVpPpowulvmcVrB9R6BRoIvE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleTest() {
    console.log('🔍 Probando conexión a Supabase...');
    
    try {
        // Primero verificar si hay usuarios en la base de datos
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('email, name, email_verified')
            .limit(5);
            
        if (usersError) {
            console.error('❌ Error obteniendo usuarios:', usersError.message);
            return;
        }
        
        console.log('✅ Conexión exitosa!');
        console.log('📊 Usuarios en la base de datos:', users.length);
        
        if (users.length > 0) {
            console.log('👤 Usuarios encontrados:');
            users.forEach(user => {
                console.log(`  - ${user.email} (${user.name}) - Verificado: ${user.email_verified ? 'Sí' : 'No'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error inesperado:', error.message);
    }
}

simpleTest();
