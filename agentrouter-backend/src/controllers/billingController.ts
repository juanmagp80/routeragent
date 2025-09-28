import { Request, Response } from 'express';
import { StripeService } from '../services/stripeService';

const stripeService = new StripeService();

export class BillingController {
    // Crear sesión de checkout para actualizar plan
    async createCheckoutSession(req: Request, res: Response) {
        try {
            const { priceId, userId, customerId } = req.body;

            if (!priceId || !userId) {
                return res.status(400).json({
                    success: false,
                    error: 'priceId and userId are required'
                });
            }

            const session = await stripeService.createCheckoutSession(userId, priceId, customerId);

            res.json({
                success: true,
                data: {
                    sessionId: session.id,
                    url: session.url
                }
            });
        } catch (error) {
            console.error('Error creating checkout session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create checkout session'
            });
        }
    }

    // Crear sesión del portal de facturación
    async createBillingPortalSession(req: Request, res: Response) {
        try {
            const { customerId } = req.body;

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    error: 'customerId is required'
                });
            }

            const session = await stripeService.createBillingPortalSession(customerId);

            res.json({
                success: true,
                data: {
                    url: session.url
                }
            });
        } catch (error) {
            console.error('Error creating billing portal session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create billing portal session'
            });
        }
    }

    // Obtener información de facturación del usuario
    async getBillingInfo(req: Request, res: Response) {
        try {
            const { customerId } = req.params;

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    error: 'customerId is required'
                });
            }

            const [customer, subscriptions, invoices] = await Promise.all([
                stripeService.getCustomer(customerId),
                stripeService.getCustomerSubscriptions(customerId),
                stripeService.getCustomerInvoices(customerId, 10)
            ]);

            res.json({
                success: true,
                data: {
                    customer,
                    subscriptions: subscriptions.data,
                    invoices: invoices.data
                }
            });
        } catch (error) {
            console.error('Error getting billing info:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get billing info'
            });
        }
    }

    // Obtener facturas del usuario
    async getInvoices(req: Request, res: Response) {
        try {
            const { customerId } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    error: 'customerId is required'
                });
            }

            const invoices = await stripeService.getCustomerInvoices(customerId, limit);

            const formattedInvoices = invoices.data.map(invoice => ({
                id: invoice.id,
                date: new Date(invoice.created * 1000).toLocaleDateString('es-ES'),
                amount: invoice.total / 100, // Convertir de centavos a euros/dolares
                currency: invoice.currency.toUpperCase(),
                status: invoice.status,
                description: invoice.lines.data[0]?.description || 'Suscripción',
                pdf_url: invoice.invoice_pdf,
                hosted_url: invoice.hosted_invoice_url
            }));

            res.json({
                success: true,
                data: formattedInvoices
            });
        } catch (error) {
            console.error('Error getting invoices:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get invoices'
            });
        }
    }

    // Descargar factura en PDF
    async downloadInvoicePdf(req: Request, res: Response) {
        try {
            const { invoiceId } = req.params;

            if (!invoiceId) {
                return res.status(400).json({
                    success: false,
                    error: 'invoiceId is required'
                });
            }

            const invoice = await stripeService.getInvoice(invoiceId);

            if (!invoice.invoice_pdf) {
                return res.status(404).json({
                    success: false,
                    error: 'PDF not available for this invoice'
                });
            }

            res.json({
                success: true,
                data: {
                    pdf_url: invoice.invoice_pdf,
                    hosted_url: invoice.hosted_invoice_url
                }
            });
        } catch (error) {
            console.error('Error downloading invoice PDF:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to download invoice PDF'
            });
        }
    }

    // Actualizar suscripción
    async updateSubscription(req: Request, res: Response) {
        try {
            const { subscriptionId, priceId } = req.body;

            if (!subscriptionId || !priceId) {
                return res.status(400).json({
                    success: false,
                    error: 'subscriptionId and priceId are required'
                });
            }

            const subscription = await stripeService.updateSubscription(subscriptionId, priceId);

            res.json({
                success: true,
                data: subscription
            });
        } catch (error) {
            console.error('Error updating subscription:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update subscription'
            });
        }
    }

    // Cancelar suscripción
    async cancelSubscription(req: Request, res: Response) {
        try {
            const { subscriptionId } = req.body;
            const { cancelAtPeriodEnd = true } = req.body;

            if (!subscriptionId) {
                return res.status(400).json({
                    success: false,
                    error: 'subscriptionId is required'
                });
            }

            const subscription = await stripeService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);

            res.json({
                success: true,
                data: subscription
            });
        } catch (error) {
            console.error('Error canceling subscription:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to cancel subscription'
            });
        }
    }

    // Webhook de Stripe
    async handleWebhook(req: Request, res: Response) {
        try {
            const signature = req.headers['stripe-signature'] as string;
            const payload = req.body;

            if (!signature) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing stripe signature'
                });
            }

            const event = await stripeService.handleWebhook(payload, signature);

            res.json({
                success: true,
                data: { received: true, type: event.type }
            });
        } catch (error) {
            console.error('Error handling webhook:', error);
            res.status(400).json({
                success: false,
                error: 'Webhook signature verification failed'
            });
        }
    }

    // Crear cliente en Stripe
    async createCustomer(req: Request, res: Response) {
        try {
            const { email, name, userId } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'email is required'
                });
            }

            const customer = await stripeService.createCustomer(email, name, userId);

            res.json({
                success: true,
                data: customer
            });
        } catch (error) {
            console.error('Error creating customer:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create customer'
            });
        }
    }

    // Obtener precios disponibles
    async getPrices(req: Request, res: Response) {
        try {
            const prices = await stripeService.getPrices();

            const formattedPrices = prices.data.map(price => ({
                id: price.id,
                product_id: typeof price.product === 'string' ? price.product : price.product?.id,
                product_name: typeof price.product === 'object' && 'name' in price.product ? price.product.name : '',
                amount: price.unit_amount ? price.unit_amount / 100 : 0,
                currency: price.currency,
                interval: price.recurring?.interval,
                interval_count: price.recurring?.interval_count,
                active: price.active
            }));

            res.json({
                success: true,
                data: formattedPrices
            });
        } catch (error) {
            console.error('Error getting prices:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get prices'
            });
        }
    }
}