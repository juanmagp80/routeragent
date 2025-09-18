#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

// Cambiar al directorio del backend
const backendDir = path.resolve(__dirname, '..');
process.chdir(backendDir);

console.log('Starting AgentRouter MCP Backend...');

try {
    // Ejecutar las migraciones de la base de datos
    console.log('\n1. Running database migrations...');
    execSync('npx supabase migration up', { stdio: 'inherit' });
    console.log('✅ Database migrations completed successfully');

    // Ejecutar el script de configuración y seeding de la base de datos
    console.log('\n2. Setting up and seeding database...');
    execSync('npm run setup-database', { stdio: 'inherit' });
    console.log('✅ Database setup and seeding completed successfully');

    // Construir el proyecto
    console.log('\n3. Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Project built successfully');

    // Iniciar el servidor
    console.log('\n4. Starting server...');
    execSync('npm run start', { stdio: 'inherit' });
} catch (error) {
    console.error('\n❌ Error starting backend:', error);
    process.exit(1);
}