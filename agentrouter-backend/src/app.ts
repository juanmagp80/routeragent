import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
dotenv.config();

// Verificar que tenemos la clave de Stripe
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
}

console.log('✅ Stripe key loaded:', process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...');

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Importar controladores
import {
    createApiKey,
    deactivateApiKey,
    deleteApiKey,
    getApiKeyStats,
    listApiKeys,
    validateApiKey,
    listApiKeysDev,
    createApiKeyDev,
    deleteApiKeyDev,
    getMetricsDev,
    getBillingDev
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

// ====== RUTAS TEMPORALES PARA DESARROLLO (SIN AUTENTICACIÓN) ======
// TODO: Remover estas rutas una vez que la autenticación esté funcionando
app.get('/v1/api-keys-dev', listApiKeysDev);
app.post('/v1/api-keys-dev', createApiKeyDev);
app.delete('/v1/api-keys-dev/:keyId', deleteApiKeyDev);
app.get('/v1/api-keys-dev/:keyId/stats', getApiKeyStats);
app.get('/v1/metrics-dev', getMetricsDev);
app.get('/v1/billing-dev', getBillingDev);
app.post('/v1/checkout-session-dev', async (req, res) => {
    try {
        console.log('💳 Creating Stripe checkout session...');
        console.log('Request body:', req.body);
        console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
        
        const { plan_id, success_url, cancel_url } = req.body;

        if (!plan_id || !success_url || !cancel_url) {
            return res.status(400).json({
                error: 'Missing required fields: plan_id, success_url, cancel_url',
                success: false
            });
        }

        // Verificar que tenemos la clave de Stripe
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
            return res.status(500).json({
                error: 'Stripe configuration missing',
                success: false
            });
        }

        console.log('✅ All validations passed, creating Stripe session...');

        // Definir precios según el plan (con recurrencia mensual)
        const priceData = {
            pro: {
                unit_amount: 4900, // €49 en céntimos
                currency: 'eur' as const,
                recurring: {
                    interval: 'month' as const
                },
                product_data: {
                    name: 'Plan Pro',
                    description: 'Hasta 5,000 requests/mes, acceso a todos los modelos de IA'
                }
            },
            enterprise: {
                unit_amount: 29900, // €299 en céntimos  
                currency: 'eur' as const,
                recurring: {
                    interval: 'month' as const
                },
                product_data: {
                    name: 'Plan Enterprise',
                    description: 'Requests ilimitados, acceso a modelos premium, soporte dedicado'
                }
            }
        };

        const price = priceData[plan_id as keyof typeof priceData];
        
        if (!price) {
            return res.status(400).json({
                error: 'Invalid plan_id',
                success: false
            });
        }

        console.log('✅ Price data:', price);

        // Crear sesión de Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: price,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: {
                plan_id: plan_id,
                user_id: 'user_dev_001' // En producción, usar el ID del usuario real
            }
        });

        console.log('✅ Real Stripe checkout session created:', session.id);
        
        res.json({
            checkout_session: {
                id: session.id,
                url: session.url,
                payment_status: session.payment_status,
                success_url: session.success_url,
                cancel_url: session.cancel_url,
                plan_id: plan_id,
                amount: price.unit_amount,
                currency: price.currency
            },
            success: true
        });

    } catch (error) {
        console.error('❌ Error creating Stripe checkout session:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false 
        });
    }
});

// Rutas de facturación con Stripe
app.use('/v1/billing', billingRoutes);

// Webhook de Stripe (debe ir ANTES de express.json() para recibir raw body)
app.post('/webhook/stripe', webhookController.handleStripeWebhook);

// Webhook de desarrollo (sin verificación de firma)
app.post('/webhook/stripe-dev', async (req, res) => {
    try {
        console.log('🧪 Webhook de desarrollo recibido:', req.body.type);
        
        // Simular evento de Stripe
        const event = req.body;
        
        // Procesar checkout completado
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const planId = session.metadata?.plan_id;
            
            if (planId) {
                console.log(`🎉 Simulando actualización de plan a: ${planId}`);
                
                // Actualizar directamente en Supabase
                const { data, error } = await supabase
                    .from('users')
                    .update({
                        plan: planId,
                        stripe_customer_id: session.customer,
                        subscription_id: session.subscription,
                        subscription_status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', 'test@routerai.com')
                    .select();
                
                if (error) {
                    console.error('❌ Error actualizando usuario:', error);
                    res.status(500).json({ error: 'Error actualizando usuario' });
                    return;
                }
                
                console.log('✅ Usuario actualizado exitosamente:', data);
                res.json({ success: true, updated_user: data });
            } else {
                res.status(400).json({ error: 'No plan_id en metadatos' });
            }
        } else {
            res.json({ received: true, message: 'Evento no procesado en desarrollo' });
        }
    } catch (error) {
        console.error('❌ Error en webhook de desarrollo:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

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