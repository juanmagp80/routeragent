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
const stripe_1 = __importDefault(require("stripe"));
const supabase_js_1 = require("@supabase/supabase-js");
// Cargar variables de entorno
dotenv_1.default.config({ path: '.env.local' });
dotenv_1.default.config(); // fallback para .env
// Verificar que tenemos la clave de Stripe
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
}
console.log('✅ Stripe key loaded:', process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...');
// Verificar que tenemos la clave de Resend
if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    console.error('Please check your .env.local file and ensure RESEND_API_KEY is set');
    process.exit(1);
}
console.log('✅ Resend key loaded:', process.env.RESEND_API_KEY?.substring(0, 12) + '...');
// Inicializar Stripe
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
// Importar controladores
const apiKeyController_1 = require("./controllers/apiKeyController");
const authController_1 = require("./controllers/authController");
const routeController_1 = require("./controllers/routeController");
const userController_1 = require("./controllers/userController");
// Importar rutas
const billing_1 = __importDefault(require("./routes/billing"));
// Importar webhook controller
const webhookController_1 = require("./controllers/webhookController");
// Importar middleware
const auth_1 = require("./middleware/auth");
const authSupabase_1 = require("./middleware/authSupabase");
const app = (0, express_1.default)();
// Render usa el puerto 10000, pero también soportamos 3003 para desarrollo local
const PORT = parseInt(process.env.PORT || '3003', 10);
// Inicializar controladores
const webhookController = new webhookController_1.WebhookController();
// Middleware especial para webhooks de Stripe (antes del parser JSON)
app.use('/webhook/stripe', express_1.default.raw({ type: 'application/json' }));
// Middleware
app.use((0, helmet_1.default)()); // Seguridad
// CORS configurado para producción y desarrollo
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps, Postman)
        if (!origin)
            return callback(null, true);
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
app.use((0, cors_1.default)(corsOptions));
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
// Endpoint temporal para probar Supabase
app.get('/test-supabase', async (req, res) => {
    try {
        console.log('🔍 Testing Supabase connection...');
        console.log('📍 URL:', supabaseUrl);
        console.log('🔑 Service Key available:', !!supabaseServiceKey);
        const { data, error } = await supabase
            .from('users')
            .select('id, email, plan')
            .limit(1);
        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                error: 'Supabase connection failed',
                details: error
            });
        }
        console.log('✅ Supabase connection successful');
        res.json({
            success: true,
            message: 'Supabase connected',
            sampleData: data
        });
    }
    catch (err) {
        console.error('❌ Connection error:', err);
        res.status(500).json({
            error: 'Connection failed',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});
// Rutas de gestión de API Keys (requieren autenticación Supabase)
app.post('/v1/api-keys', authSupabase_1.authenticateSupabase, apiKeyController_1.createApiKey);
app.get('/v1/api-keys', authSupabase_1.authenticateSupabase, apiKeyController_1.listApiKeys);
app.delete('/v1/api-keys/:keyId', authSupabase_1.authenticateSupabase, apiKeyController_1.deactivateApiKey);
app.delete('/v1/api-keys/:keyId/permanent', authSupabase_1.authenticateSupabase, apiKeyController_1.deleteApiKey);
app.get('/v1/api-keys/:keyId/stats', authSupabase_1.authenticateSupabase, apiKeyController_1.getApiKeyStats);
app.post('/v1/api-keys/validate', apiKeyController_1.validateApiKey); // Esta ruta no necesita autenticación
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
// ====== RUTAS TEMPORALES PARA DESARROLLO (SIN AUTENTICACIÓN) ======
// TODO: Remover estas rutas una vez que la autenticación esté funcionando
app.get('/v1/api-keys-dev', apiKeyController_1.listApiKeysDev);
app.post('/v1/api-keys-dev', apiKeyController_1.createApiKeyDev);
app.delete('/v1/api-keys-dev/:keyId', apiKeyController_1.deleteApiKeyDev);
app.get('/v1/api-keys-dev/:keyId/stats', apiKeyController_1.getApiKeyStats);
app.get('/v1/metrics-dev', apiKeyController_1.getMetricsDev);
app.get('/v1/billing-dev', apiKeyController_1.getBillingDev);
app.get('/v1/user-dev', apiKeyController_1.getCurrentUserDev);
app.put('/v1/user-dev', apiKeyController_1.updateCurrentUserDev);
app.put('/v1/user-notifications-dev', apiKeyController_1.updateUserNotificationsDev);
// Rutas para validar webhooks
app.post('/v1/validate-slack-webhook', apiKeyController_1.validateSlackWebhook);
app.post('/v1/validate-discord-webhook', apiKeyController_1.validateDiscordWebhook);
// 🧪 Rutas de prueba para notificaciones (temporal)
app.post('/v1/test-notification-api-key-created', apiKeyController_1.testNotificationApiKeyCreated);
app.post('/v1/test-notification-usage-alert', apiKeyController_1.testNotificationUsageAlert);
app.post('/v1/test-notification-welcome', apiKeyController_1.testNotificationWelcome);
app.post('/v1/test-notification-payment-success', apiKeyController_1.testNotificationPaymentSuccess);
// 🔔 Rutas para gestionar notificaciones en página
app.get('/v1/notifications', apiKeyController_1.getNotifications);
app.put('/v1/notifications/:notificationId/read', apiKeyController_1.markNotificationAsRead);
app.put('/v1/notifications/read-all', apiKeyController_1.markAllNotificationsAsRead);
// Ruta para enviar notificación de prueba
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
                currency: 'eur',
                recurring: {
                    interval: 'month'
                },
                product_data: {
                    name: 'Plan Pro',
                    description: 'Hasta 5,000 requests/mes, acceso a todos los modelos de IA'
                }
            },
            enterprise: {
                unit_amount: 29900, // €299 en céntimos  
                currency: 'eur',
                recurring: {
                    interval: 'month'
                },
                product_data: {
                    name: 'Plan Enterprise',
                    description: 'Requests ilimitados, acceso a modelos premium, soporte dedicado'
                }
            }
        };
        const price = priceData[plan_id];
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
    }
    catch (error) {
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
app.use('/v1/billing', billing_1.default);
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
                    .eq('email', 'juangpdev@gmail.com')
                    .select();
                if (error) {
                    console.error('❌ Error actualizando usuario:', error);
                    res.status(500).json({ error: 'Error actualizando usuario' });
                    return;
                }
                console.log('✅ Usuario actualizado exitosamente:', data);
                res.json({ success: true, updated_user: data });
            }
            else {
                res.status(400).json({ error: 'No plan_id en metadatos' });
            }
        }
        else {
            res.json({ received: true, message: 'Evento no procesado en desarrollo' });
        }
    }
    catch (error) {
        console.error('❌ Error en webhook de desarrollo:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});
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
