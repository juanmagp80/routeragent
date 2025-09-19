#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
// Cambiar al directorio del backend
const backendDir = path_1.default.resolve(__dirname, '..');
process.chdir(backendDir);
console.log('Starting AgentRouter MCP Backend...');
try {
    // Ejecutar las migraciones de la base de datos
    console.log('\n1. Running database migrations...');
    (0, child_process_1.execSync)('npx supabase migration up', { stdio: 'inherit' });
    console.log('✅ Database migrations completed successfully');
    // Ejecutar el script de configuración y seeding de la base de datos
    console.log('\n2. Setting up and seeding database...');
    (0, child_process_1.execSync)('npm run setup-database', { stdio: 'inherit' });
    console.log('✅ Database setup and seeding completed successfully');
    // Construir el proyecto
    console.log('\n3. Building project...');
    (0, child_process_1.execSync)('npm run build', { stdio: 'inherit' });
    console.log('✅ Project built successfully');
    // Iniciar el servidor
    console.log('\n4. Starting server...');
    (0, child_process_1.execSync)('npm run start', { stdio: 'inherit' });
}
catch (error) {
    console.error('\n❌ Error starting backend:', error);
    process.exit(1);
}
