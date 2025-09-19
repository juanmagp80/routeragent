"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seedDatabase_1 = __importDefault(require("./seedDatabase"));
const setupDatabase_1 = __importDefault(require("./setupDatabase"));
async function setupAndSeedDatabase() {
    console.log('Setting up and seeding database...');
    try {
        // Configurar la base de datos
        await (0, setupDatabase_1.default)();
        // Sembrar la base de datos con datos de ejemplo
        await (0, seedDatabase_1.default)();
        console.log('Database setup and seeding completed successfully');
    }
    catch (error) {
        console.error('Error setting up and seeding database:', error);
    }
}
// Ejecutar la configuración y el seeding si se llama directamente
if (require.main === module) {
    setupAndSeedDatabase();
}
exports.default = setupAndSeedDatabase;
