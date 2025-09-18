// Script para probar el login sin verificación de email
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjQyMTksImV4cCI6MjA3MzYwMDIxOX0._2aqWnPZlUGTIz-8INCWVpPpowulvmcVrB9R6BRoIvE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('🧪 Probando login...');
    
    try {
        // Intentar login con un usuario de prueba
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'testuser@gmail.com',
            password: 'password123'
        });
        
        if (error) {
            console.error('❌ Error de login:', error.message);
            return;
        }
        
        console.log('✅ Login exitoso!');
        console.log('Usuario:', data.user.email);
        console.log('Verificado:', data.user.email_confirmed_at ? 'Sí' : 'No');
        
        // Intentar obtener datos de la tabla users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
        if (userError) {
            console.error('❌ Error obteniendo datos del usuario:', userError.message);
        } else {
            console.log('✅ Datos del usuario obtenidos:');
            console.log('Nombre:', userData.name);
            console.log('Plan:', userData.plan);
            console.log('Email verificado en tabla:', userData.email_verified);
        }
        
    } catch (error) {
        console.error('❌ Error inesperado:', error);
    }
}

async function registerTestUser() {
    console.log('📝 Registrando usuario de prueba...');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: 'testuser@gmail.com',
            password: 'password123',
            options: {
                data: {
                    name: 'Usuario de Prueba',
                    company: 'Test Company',
                    plan: 'free'
                }
            }
        });
        
        if (error) {
            console.error('❌ Error de registro:', error.message);
            return;
        }
        
        console.log('✅ Usuario registrado exitosamente!');
        console.log('ID:', data.user.id);
        console.log('Email:', data.user.email);
        
    } catch (error) {
        console.error('❌ Error inesperado:', error);
    }
}

async function markEmailAsVerified() {
    console.log('✉️ Marcando email como verificado...');
    
    try {
        // Primero obtener el usuario actual
        const { data: authData } = await supabase.auth.getUser();
        
        if (!authData.user) {
            console.log('No hay usuario autenticado');
            return;
        }
        
        // Como no podemos actualizar auth.users directamente desde aquí,
        // solo actualizamos la tabla users
        const { error } = await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('id', authData.user.id);
            
        if (error) {
            console.error('❌ Error actualizando verificación:', error.message);
        } else {
            console.log('✅ Email marcado como verificado en tabla users');
        }
        
    } catch (error) {
        console.error('❌ Error inesperado:', error);
    }
}

async function main() {
    console.log('🚀 Iniciando pruebas de autenticación...\n');
    
    // Registrar usuario de prueba
    await registerTestUser();
    console.log('\n');
    
    // Esperar un poco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Probar login
    await testLogin();
}

// Ejecutar si es el módulo principal
main();
