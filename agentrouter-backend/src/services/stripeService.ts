import Stripe from 'stripe';

export class StripeService {
    private stripe: Stripe;

    constructor() {
        // Usar la clave secreta de Stripe del entorno
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2025-08-27.basil',
        });
    }

    // Crear una sesión de checkout para actualizar plan
    async createCheckoutSession(userId: string, priceId: string, customerId?: string) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer: customerId,
                client_reference_id: userId,
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${process.env.FRONTEND_URL}/admin/billing?success=true`,
                cancel_url: `${process.env.FRONTEND_URL}/admin/billing?canceled=true`,
                metadata: {
                    userId: userId,
                },
            });

            return session;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    // Crear un portal de facturación para gestionar suscripción
    async createBillingPortalSession(customerId: string) {
        try {
            const session = await this.stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: `${process.env.FRONTEND_URL}/admin/billing`,
            });

            return session;
        } catch (error) {
            console.error('Error creating billing portal session:', error);
            throw error;
        }
    }

    // Obtener información del cliente
    async getCustomer(customerId: string) {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);
            return customer;
        } catch (error) {
            console.error('Error getting customer:', error);
            throw error;
        }
    }

    // Obtener suscripciones del cliente
    async getCustomerSubscriptions(customerId: string) {
        try {
            const subscriptions = await this.stripe.subscriptions.list({
                customer: customerId,
                status: 'all',
                expand: ['data.default_payment_method', 'data.items.data.price'],
            });

            return subscriptions;
        } catch (error) {
            console.error('Error getting subscriptions:', error);
            throw error;
        }
    }

    // Obtener facturas del cliente
    async getCustomerInvoices(customerId: string, limit: number = 10) {
        try {
            const invoices = await this.stripe.invoices.list({
                customer: customerId,
                limit: limit,
                expand: ['data.payment_intent'],
            });

            return invoices;
        } catch (error) {
            console.error('Error getting invoices:', error);
            throw error;
        }
    }

    // Obtener una factura específica
    async getInvoice(invoiceId: string) {
        try {
            const invoice = await this.stripe.invoices.retrieve(invoiceId);
            return invoice;
        } catch (error) {
            console.error('Error getting invoice:', error);
            throw error;
        }
    }

    // Crear un cliente en Stripe
    async createCustomer(email: string, name?: string, userId?: string) {
        try {
            const customer = await this.stripe.customers.create({
                email: email,
                name: name,
                metadata: {
                    userId: userId || '',
                },
            });

            return customer;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    // Actualizar suscripción
    async updateSubscription(subscriptionId: string, priceId: string) {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

            const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
                items: [
                    {
                        id: subscription.items.data[0].id,
                        price: priceId,
                    },
                ],
                proration_behavior: 'create_prorations',
            });

            return updatedSubscription;
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    }

    // Cancelar suscripción
    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: cancelAtPeriodEnd,
            });

            return subscription;
        } catch (error) {
            console.error('Error canceling subscription:', error);
            throw error;
        }
    }

    // Manejar webhooks
    async handleWebhook(payload: string | Buffer, signature: string) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET || ''
            );

            switch (event.type) {
                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return event;
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }

    private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
        console.log('Subscription created:', subscription.id);
        // Aquí actualizarías la base de datos del usuario
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        console.log('Subscription updated:', subscription.id);
        // Aquí actualizarías el plan del usuario en la base de datos
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        console.log('Subscription deleted:', subscription.id);
        // Aquí cambiarías al usuario al plan gratuito
    }

    private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
        console.log('Invoice payment succeeded:', invoice.id);
        // Aquí confirmarías el pago en tu base de datos
    }

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        console.log('Invoice payment failed:', invoice.id);
        // Aquí manejarías el fallo de pago
    }

    // Obtener precios/productos
    async getPrices() {
        try {
            const prices = await this.stripe.prices.list({
                active: true,
                expand: ['data.product'],
            });

            return prices;
        } catch (error) {
            console.error('Error getting prices:', error);
            throw error;
        }
    }

    // Generar URL de descarga de factura
    getInvoicePdfUrl(invoiceId: string): string {
        return `https://pay.stripe.com/invoice/${invoiceId}`;
    }
}