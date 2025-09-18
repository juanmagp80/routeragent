import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Cargar variables de entorno
dotenv.config();

// Importar controladores
import {
    createApiKey,
    deactivateApiKey,
    getApiKeyStats,
    listApiKeys,
    validateApiKey
} from './controllers/apiKeyController';
import {
    getCurrentUser,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    verifyEmail
} from './controllers/authController';
import {
    clearCache,
    getMetrics,
    getPerformanceStats,
    routeTask
} from './controllers/routeController';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser
} from './controllers/userController';

// Importar middleware
import { authenticateApiKey, optionalAuth } from './middleware/auth';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet()); // Seguridad
app.use(cors()); // CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Rutas
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'AgentRouter MCP API',
        version: '1.0.0',
        endpoints: {
            'POST /v1/route': 'Route tasks to optimal AI model',
            'GET /v1/metrics': 'Get usage metrics'
        }
    });
});

// Rutas de gestión de API Keys (sin autenticación para testing inicial)
app.post('/v1/api-keys', createApiKey);
app.get('/v1/api-keys', listApiKeys);
app.delete('/v1/api-keys/:keyId', deactivateApiKey);
app.get('/v1/api-keys/:keyId/stats', getApiKeyStats);
app.post('/v1/api-keys/validate', validateApiKey);

// Rutas de gestión de usuarios
app.get('/v1/users', getUsers);
app.get('/v1/users/:id', getUserById);
app.post('/v1/users', createUser);
app.put('/v1/users/:id', updateUser);
app.delete('/v1/users/:id', deleteUser);

// Rutas de autenticación
app.post('/v1/auth/register', register);
app.post('/v1/auth/login', login);
app.post('/v1/auth/logout', logout);
app.get('/v1/auth/me', getCurrentUser);
app.post('/v1/auth/verify-email', verifyEmail);
app.post('/v1/auth/request-password-reset', requestPasswordReset);
app.post('/v1/auth/reset-password', resetPassword);

// Ruta principal de ruteo (requiere API Key)
app.post('/v1/route', authenticateApiKey, routeTask);

// Ruta de métricas (autenticación opcional)
app.get('/v1/metrics', optionalAuth, getMetrics);

// Rutas de rendimiento y cache
app.get('/v1/performance', getPerformanceStats);
app.post('/v1/cache/clear', clearCache);

// Manejador de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        success: false
    });
});

// Manejador para rutas no encontradas
app.use('*', (req: Request, res: Response) => {
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

export default app;