"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
async function runMigrations() {
    console.log('Running database migrations...');
    try {
        // Ejecutar las migraciones de Supabase
        const { stdout, stderr } = await execPromise('npx supabase migration up');
        if (stderr) {
            console.error('Error running migrations:', stderr);
        }
        else {
            console.log('Migrations output:', stdout);
            console.log('Database migrations completed successfully');
        }
    }
    catch (error) {
        console.error('Error running database migrations:', error);
    }
}
// Ejecutar las migraciones si se llama directamente
if (require.main === module) {
    runMigrations();
}
exports.default = runMigrations;
