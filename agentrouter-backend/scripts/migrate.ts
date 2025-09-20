import fs from 'fs';
import { supabase } from '../src/config/database';

async function runMigrations() {
    console.log('🚀 Iniciando migraciones de base de datos...');

    try {
        // Leer el archivo SQL de migración
        const schemaSql = fs.readFileSync('./database/schema.sql', 'utf8');

        // Ejecutar las migraciones
        const { error } = await supabase.rpc('execute_sql', { sql: schemaSql });

        if (error) {
            console.error('❌ Error ejecutando migraciones:', error);
            process.exit(1);
        }

        console.log('✅ Migraciones completadas exitosamente');

    } catch (error) {
        console.error('❌ Error durante las migraciones:', error);
        process.exit(1);
    }
}

runMigrations();