import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function initAndRunBackend() {
    console.log('Initializing and running backend...');

    try {
        // Ejecutar las migraciones de la base de datos
        console.log('Running database migrations...');
        const { stdout: migrateStdout, stderr: migrateStderr } = await execPromise('npx supabase migration up');

        if (migrateStderr) {
            console.error('Error running migrations:', migrateStderr);
        } else {
            console.log('Migrations output:', migrateStdout);
            console.log('Database migrations completed successfully');
        }

        // Ejecutar el script de configuración y seeding de la base de datos
        console.log('Setting up and seeding database...');
        const { stdout: setupStdout, stderr: setupStderr } = await execPromise('npm run setup-database');

        if (setupStderr) {
            console.error('Error setting up database:', setupStderr);
        } else {
            console.log('Setup output:', setupStdout);
            console.log('Database setup and seeding completed successfully');
        }

        // Iniciar el servidor
        console.log('Starting server...');
        const { stdout: startStdout, stderr: startStderr } = await execPromise('npm run start');

        if (startStderr) {
            console.error('Error starting server:', startStderr);
        } else {
            console.log('Server output:', startStdout);
            console.log('Server started successfully');
        }
    } catch (error) {
        console.error('Error initializing and running backend:', error);
    }
}

// Ejecutar la inicialización y el servidor si se llama directamente
if (require.main === module) {
    initAndRunBackend();
}

export default initAndRunBackend;