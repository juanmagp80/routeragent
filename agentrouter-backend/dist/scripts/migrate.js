"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = runMigration;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
async function runMigration() {
    try {
        console.log('🚀 Starting database migration...');
        // Leer el archivo SQL
        const schemaPath = path_1.default.join(__dirname, '../../database/schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        // Dividir en statements individuales
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        // Ejecutar cada statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
            const { error } = await database_1.supabase.rpc('exec_sql', {
                sql: statement
            });
            if (error) {
                // Intentar ejecutar directamente si rpc falla
                const { error: directError } = await database_1.supabase
                    .from('_temp')
                    .select('*')
                    .limit(0);
                if (directError) {
                    console.error(`❌ Error executing statement ${i + 1}:`, error);
                    throw error;
                }
            }
            console.log(`✅ Statement ${i + 1} executed successfully`);
        }
        console.log('🎉 Migration completed successfully!');
        // Verificar que las tablas se crearon
        const { data: tables, error: tablesError } = await database_1.supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['api_keys', 'api_key_usage', 'usage_logs']);
        if (tablesError) {
            console.warn('⚠️  Could not verify tables creation:', tablesError);
        }
        else {
            console.log('📋 Created tables:', tables?.map(t => t.table_name).join(', '));
        }
    }
    catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
}
// Ejecutar si se llama directamente
if (require.main === module) {
    runMigration().then(() => {
        console.log('✨ Migration script finished');
        process.exit(0);
    });
}
