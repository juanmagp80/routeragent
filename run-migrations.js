// Script para ejecutar migraciones en Supabase
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  // URL de conexión con pooler (funciona mejor para conexiones externas)
  const connectionString = 'postgresql://postgres.jmfegokyvaflwegtyaun:Solketal@24@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('🔗 Conectado a Supabase');
    
    // Lista de migraciones en orden
    const migrations = [
      '001_create_users_table.sql',
      '003_auth_trigger.sql',
      '004_setup_rls.sql'
    ];
    
    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, 'database', 'migrations', migration);
      
      if (fs.existsSync(migrationPath)) {
        console.log(`📄 Ejecutando migración: ${migration}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        try {
          await client.query(sql);
          console.log(`✅ Migración ${migration} completada`);
        } catch (error) {
          console.error(`❌ Error en migración ${migration}:`, error.message);
        }
      } else {
        console.log(`⚠️  Archivo de migración no encontrado: ${migration}`);
      }
    }
    
    console.log('\n🎉 Todas las migraciones completadas');
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

runMigrations();
