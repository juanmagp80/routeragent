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
    deleteApiKey,
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

// Importar rutas
import billingRoutes from './routes/billing';

// Importar webhook controller
import { WebhookController } from './controllers/webhookController';

// Importar middleware
import { authenticateApiKey, optionalAuth } from './middleware/auth';
import { authenticateSupabase } from './middleware/authSupabase';

const app: Application = express();
// Render usa el puerto 10000, pero también soportamos 3003 para desarrollo local
const PORT: number = parseInt(process.env.PORT || '3003', 10);

// Inicializar controladores
const webhookController = new WebhookController();

// Middleware especial para webhooks de Stripe (antes del parser JSON)
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

// Middleware
app.use(helmet()); // Seguridad

// CORS configurado para producción y desarrollo
const corsOptions = {
    origin: function (origin: any, callback: any) {
        // Permitir requests sin origin (como mobile apps, Postman)
        if (!origin) return callback(null, true);

        // Lista de dominios permitidos
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            process.env.FRONTEND_URL, // URL del frontend en producción
            'https://routeragent.vercel.app', // Frontend en Vercel
            'https://routerai.vercel.app', // Alternativa del frontend
            'https://routerai-backend.onrender.com' // Backend en Render
        ].filter(Boolean);

        // Patrones regex para dominios dinámicos
        const allowedPatterns = [
            /^https:\/\/.*\.onrender\.com$/,
            /^https:\/\/.*\.vercel\.app$/
        ];

        // Verificar dominios exactos
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Verificar patrones regex
        for (const pattern of allowedPatterns) {
            if (pattern.test(origin)) {
                return callback(null, true);
            }
        }

        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'stripe-signature']
};

app.use(cors(corsOptions));
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

// Rutas de gestión de API Keys (requieren autenticación Supabase)
app.post('/v1/api-keys', authenticateSupabase as any, createApiKey as any);
app.get('/v1/api-keys', authenticateSupabase as any, listApiKeys as any);
app.delete('/v1/api-keys/:keyId', authenticateSupabase as any, deactivateApiKey as any);
app.delete('/v1/api-keys/:keyId/permanent', authenticateSupabase as any, deleteApiKey as any);
app.get('/v1/api-keys/:keyId/stats', authenticateSupabase as any, getApiKeyStats as any);
app.post('/v1/api-keys/validate', validateApiKey); // Esta ruta no necesita autenticación

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

// Ruta de testing temporal (sin autenticación)
app.post('/v1/route-test', routeTask);

// Rutas de facturación con Stripe
app.use('/v1/billing', billingRoutes);

// Webhook de Stripe (debe ir ANTES de express.json() para recibir raw body)
app.post('/webhook/stripe', webhookController.handleStripeWebhook);

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