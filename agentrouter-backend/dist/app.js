"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Cargar variables de entorno
dotenv_1.default.config();
// Importar controladores
const routeController_1 = require("./controllers/routeController");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Middleware
app.use((0, helmet_1.default)()); // Seguridad
app.use((0, cors_1.default)()); // CORS
app.use((0, morgan_1.default)('combined')); // Logging
app.use(express_1.default.json()); // Parse JSON
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded
// Rutas
app.get('/', (req, res) => {
    res.json({
        message: 'AgentRouter MCP API',
        version: '1.0.0',
        endpoints: {
            'POST /v1/route': 'Route tasks to optimal AI model',
            'GET /v1/metrics': 'Get usage metrics'
        }
    });
});
// Ruta principal de ruteo
app.post('/v1/route', routeController_1.routeTask);
// Ruta de métricas
app.get('/v1/metrics', routeController_1.getMetrics);
// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        success: false
    });
});
// Manejador para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        success: false
    });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/`);
    console.log(`API docs: http://localhost:${PORT}/v1/route`);
});
exports.default = app;
