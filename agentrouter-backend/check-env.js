#!/usr/bin/env node

// Verificar variables de entorno
require('dotenv').config();

console.log('🔍 Verificando variables de entorno...\n');

const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'OPENAI_API_KEY',
    'PORT'
];

const optionalEnvVars = [
    'GEMINI_API_KEY',
    'GROK_API_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY',
    'JWT_SECRET'
];

console.log('📋 Variables requeridas:');
let allRequired = true;
requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const preview = value ? value.substring(0, 20) + '...' : 'NO DEFINIDA';
    console.log(`  ${status} ${varName}: ${preview}`);
    if (!value) allRequired = false;
});

console.log('\n📋 Variables opcionales:');
optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '⚠️';
    const preview = value ? value.substring(0, 20) + '...' : 'NO DEFINIDA';
    console.log(`  ${status} ${varName}: ${preview}`);
});

console.log('\n🎯 Resultado:');
if (allRequired) {
    console.log('✅ Todas las variables requeridas están configuradas');
    console.log('🚀 El backend debería poder iniciar correctamente');
} else {
    console.log('❌ Faltan variables requeridas');
    console.log('🛑 El backend no podrá iniciar');
}

console.log('\n💡 Para iniciar el backend: npm start');
