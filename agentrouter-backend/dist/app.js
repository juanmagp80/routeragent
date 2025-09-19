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
const apiKeyController_1 = require("./controllers/apiKeyController");
const authController_1 = require("./controllers/authController");
const routeController_1 = require("./controllers/routeController");
const userController_1 = require("./controllers/userController");
// Importar middleware
const auth_1 = require("./middleware/auth");
const authJWT_1 = require("./middleware/authJWT");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Middleware
app.use((0, helmet_1.default)()); // Seguridad
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
})); // CORS
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
// Rutas de gestión de API Keys (requieren autenticación JWT)
app.post('/v1/api-keys', authJWT_1.authenticateJWT, apiKeyController_1.createApiKey);
app.get('/v1/api-keys', authJWT_1.authenticateJWT, apiKeyController_1.listApiKeys);
app.delete('/v1/api-keys/:keyId', authJWT_1.authenticateJWT, apiKeyController_1.deactivateApiKey);
app.get('/v1/api-keys/:keyId/stats', authJWT_1.authenticateJWT, apiKeyController_1.getApiKeyStats);
app.post('/v1/api-keys/validate', apiKeyController_1.validateApiKey); // Esta ruta no necesita JWT
// Rutas de gestión de usuarios
app.get('/v1/users', userController_1.getUsers);
app.get('/v1/users/:id', userController_1.getUserById);
app.post('/v1/users', userController_1.createUser);
app.put('/v1/users/:id', userController_1.updateUser);
app.delete('/v1/users/:id', userController_1.deleteUser);
// Rutas de autenticación
app.post('/v1/auth/register', authController_1.register);
app.post('/v1/auth/login', authController_1.login);
app.post('/v1/auth/logout', authController_1.logout);
app.get('/v1/auth/me', authController_1.getCurrentUser);
app.post('/v1/auth/verify-email', authController_1.verifyEmail);
app.post('/v1/auth/request-password-reset', authController_1.requestPasswordReset);
app.post('/v1/auth/reset-password', authController_1.resetPassword);
// Ruta principal de ruteo (requiere API Key)
app.post('/v1/route', auth_1.authenticateApiKey, routeController_1.routeTask);
// Ruta de testing temporal (sin autenticación)
app.post('/v1/route-test', routeController_1.routeTask);
// Ruta de métricas (autenticación opcional)
app.get('/v1/metrics', auth_1.optionalAuth, routeController_1.getMetrics);
// Rutas de rendimiento y cache
app.get('/v1/performance', routeController_1.getPerformanceStats);
app.post('/v1/cache/clear', routeController_1.clearCache);
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
