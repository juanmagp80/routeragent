import app from '../app';
import setupAndSeedDatabase from './setupAndSeedDatabase';

const PORT: number = parseInt(process.env.PORT || '3000', 10);

async function runBackend() {
    console.log('Starting backend...');

    try {
        // Configurar y sembrar la base de datos
        await setupAndSeedDatabase();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/`);
            console.log(`API docs: http://localhost:${PORT}/v1/route`);
        });
    } catch (error) {
        console.error('Error starting backend:', error);
    }
}

// Ejecutar el backend si se llama directamente
if (require.main === module) {
    runBackend();
}

export default runBackend;