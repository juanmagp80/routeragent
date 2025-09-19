"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const setupAndSeedDatabase_1 = __importDefault(require("./setupAndSeedDatabase"));
const PORT = parseInt(process.env.PORT || '3000', 10);
async function runBackend() {
    console.log('Starting backend...');
    try {
        // Configurar y sembrar la base de datos
        await (0, setupAndSeedDatabase_1.default)();
        // Iniciar servidor
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/`);
            console.log(`API docs: http://localhost:${PORT}/v1/route`);
        });
    }
    catch (error) {
        console.error('Error starting backend:', error);
    }
}
// Ejecutar el backend si se llama directamente
if (require.main === module) {
    runBackend();
}
exports.default = runBackend;
