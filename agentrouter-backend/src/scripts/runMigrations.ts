import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runMigrations() {
    console.log('Running database migrations...');

    try {
        // Ejecutar las migraciones de Supabase
        const { stdout, stderr } = await execPromise('npx supabase migration up');

        if (stderr) {
            console.error('Error running migrations:', stderr);
        } else {
            console.log('Migrations output:', stdout);
            console.log('Database migrations completed successfully');
        }
    } catch (error) {
        console.error('Error running database migrations:', error);
    }
}

// Ejecutar las migraciones si se llama directamente
if (require.main === module) {
    runMigrations();
}

export default runMigrations;