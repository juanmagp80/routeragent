import seedDatabase from './seedDatabase';
import setupDatabase from './setupDatabase';

async function setupAndSeedDatabase() {
    console.log('Setting up and seeding database...');

    try {
        // Configurar la base de datos
        await setupDatabase();

        // Sembrar la base de datos con datos de ejemplo
        await seedDatabase();

        console.log('Database setup and seeding completed successfully');
    } catch (error) {
        console.error('Error setting up and seeding database:', error);
    }
}

// Ejecutar la configuración y el seeding si se llama directamente
if (require.main === module) {
    setupAndSeedDatabase();
}

export default setupAndSeedDatabase;