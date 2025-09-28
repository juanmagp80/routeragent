import express from 'express';
import { BillingController } from '../controllers/billingController';

const router = express.Router();
const billingController = new BillingController();

// Crear sesión de checkout
router.post('/checkout/create-session', billingController.createCheckoutSession);

// Portal de facturación de Stripe
router.post('/portal/create-session', billingController.createBillingPortalSession);

// Información de facturación del usuario
router.get('/info/:customerId', billingController.getBillingInfo);

// Obtener facturas
router.get('/invoices/:customerId', billingController.getInvoices);

// Descargar PDF de factura
router.get('/invoice/:invoiceId/pdf', billingController.downloadInvoicePdf);

// Actualizar suscripción
router.put('/subscription/update', billingController.updateSubscription);

// Cancelar suscripción
router.post('/subscription/cancel', billingController.cancelSubscription);

// Crear cliente en Stripe
router.post('/customer/create', billingController.createCustomer);

// Obtener precios disponibles
router.get('/prices', billingController.getPrices);

// Webhook de Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), billingController.handleWebhook);

export default router;