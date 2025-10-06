import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { notificationService } from '../services/notificationService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook secret - En producción esto debe estar en variables de entorno
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

export class WebhookController {

  constructor() {
  }

  /**
   * Procesar webhook de Stripe
   */
  public handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;

    console.log('🚀 WEBHOOK: Starting Stripe webhook processing...');
    console.log('🚀 WEBHOOK: Headers received:', req.headers);
    console.log('🚀 WEBHOOK: Body type:', typeof req.body);

    let event: Stripe.Event;

    try {
      // Verificar el webhook con la firma de Stripe
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log('✅ WEBHOOK: Signature verification successful');
    } catch (err: any) {
      console.error(`❌ WEBHOOK: Signature verification failed.`, err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    console.log(`✅ WEBHOOK: Event received: ${event.type}`);
    console.log(`✅ WEBHOOK: Event ID: ${event.id}`);

    // Procesar diferentes tipos de eventos
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('🎉 WEBHOOK: Processing checkout.session.completed...');
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          console.log('✅ WEBHOOK: checkout.session.completed processed successfully');
          break;

        case 'customer.subscription.created':
          console.log('🆕 WEBHOOK: Processing customer.subscription.created...');
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          console.log('✅ WEBHOOK: customer.subscription.created processed successfully');
          break;
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`🔔 Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error(`❌ Error procesando webhook:`, error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  };

  /**
   * Manear checkout completado
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    console.log('🎉 CHECKOUT: Starting checkout completion process...');
    console.log('🎉 CHECKOUT: Session ID:', session.id);
    console.log('🎉 CHECKOUT: Customer ID:', session.customer);
    console.log('🎉 CHECKOUT: Subscription ID:', session.subscription);
    console.log('🎉 CHECKOUT: Payment status:', session.payment_status);
    console.log('🎉 CHECKOUT: Metadata:', JSON.stringify(session.metadata, null, 2));

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Obtener plan desde los metadatos de la sesión
    const planId = session.metadata?.plan_id;
    const userId = session.metadata?.user_id;

    console.log(`📋 CHECKOUT: Plan ID from metadata: ${planId}`);
    console.log(`👤 CHECKOUT: User ID from metadata: ${userId}`);

    if (planId) {
      console.log(`📋 CHECKOUT: Updating user to plan ${planId} from metadata`);

      // Si tenemos userId específico, usarlo; sino usar fallback para testing
      if (userId && userId !== 'user_dev_001') {
        console.log('👤 CHECKOUT: Using specific user ID path...');
        await this.updateUserPlan(userId, planId, {
          customerId,
          subscriptionId,
          priceId: null,
          status: 'active'
        });
      } else {
        // Fallback para testing - actualizar usuario de prueba
        console.log('🔄 CHECKOUT: Using fallback test user path...');
        await this.updateTestUserPlan(planId, {
          customerId,
          subscriptionId,
          status: 'active'
        });
      }
    } else if (subscriptionId) {
      console.log('📋 CHECKOUT: No metadata found, trying subscription fallback...');
      // Fallback: obtener plan desde subscription si no hay metadatos
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = this.getPlanFromPriceId(priceId);

      console.log(`📋 CHECKOUT: Plan from subscription: ${plan} (priceId: ${priceId})`);

      await this.updateTestUserPlan(plan, {
        customerId,
        subscriptionId,
        priceId,
        status: subscription.status
      });
    } else {
      console.error('❌ CHECKOUT: No plan_id in metadata and no subscription_id found');
      throw new Error('Cannot determine plan from checkout session');
    }

    console.log('✅ CHECKOUT: Checkout completion process finished successfully');
  }

  /**
   * Manejar suscripción creada
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log('🆕 Suscripción creada:', subscription.id);

    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;
    const plan = this.getPlanFromPriceId(priceId);

    // Buscar usuario por customerId y actualizar plan
    const updatedUser = await this.updateUserPlanByCustomerId(customerId, plan, {
      subscriptionId: subscription.id,
      priceId,
      status: subscription.status
    });

    // Enviar notificación de bienvenida si es un nuevo usuario
    if (updatedUser) {
      try {
        await notificationService.send({
          userId: updatedUser.id,
          type: 'welcome',
          data: {
            plan: plan,
            amount: `€${subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0}`
          }
        });
      } catch (notificationError) {
        console.error('❌ Error sending welcome notification:', notificationError);
      }
    }
  }

  /**
   * Manejar actualización de suscripción
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log('🔄 Suscripción actualizada:', subscription.id);

    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;
    const plan = this.getPlanFromPriceId(priceId);

    const updatedUser = await this.updateUserPlanByCustomerId(customerId, plan, {
      subscriptionId: subscription.id,
      priceId,
      status: subscription.status
    });

    // Enviar notificación de cambio de plan
    if (updatedUser) {
      try {
        await notificationService.send({
          userId: updatedUser.id,
          type: 'plan_change',
          data: {
            newPlan: plan,
            subscriptionId: subscription.id,
            status: subscription.status
          }
        });
      } catch (notificationError) {
        console.error('❌ Error sending plan change notification:', notificationError);
      }
    }
  }

  /**
   * Manejar eliminación de suscripción
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log('❌ Suscripción cancelada:', subscription.id);

    const customerId = subscription.customer as string;

    // Volver al plan gratuito
    await this.updateUserPlanByCustomerId(customerId, 'free', {
      subscriptionId: null,
      priceId: null,
      status: 'canceled'
    });
  }

  /**
   * Manejar pago exitoso
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log('💰 Pago exitoso:', invoice.id);

    const customerId = invoice.customer as string;
    let subscriptionId: string | undefined;

    // Obtener subscription ID desde las líneas de la factura
    if (invoice.lines?.data && invoice.lines.data.length > 0) {
      subscriptionId = invoice.lines.data[0].subscription as string;
    }

    // Actualizar estado de la suscripción como activa
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = this.getPlanFromPriceId(priceId);

      const updatedUser = await this.updateUserPlanByCustomerId(customerId, plan, {
        subscriptionId,
        priceId,
        status: 'active'
      });

      // Enviar notificación de pago exitoso
      if (updatedUser) {
        try {
          await notificationService.send({
            userId: updatedUser.id,
            type: 'payment_success',
            data: {
              amount: `€${invoice.amount_paid ? invoice.amount_paid / 100 : 0}`,
              plan: plan,
              invoiceId: invoice.id,
              period: {
                start: subscription.current_period_start,
                end: subscription.current_period_end
              }
            }
          });
        } catch (notificationError) {
          console.error('❌ Error sending payment success notification:', notificationError);
        }
      }
    }
  }

  /**
   * Manejar fallo de pago
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('💥 Pago fallido:', invoice.id);

    const customerId = invoice.customer as string;

    // Buscar usuario por customer ID para notificar
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('stripe_customer_id', customerId)
      .limit(1);

    if (!error && users && users.length > 0) {
      const user = users[0];
      try {
        await notificationService.send({
          userId: user.id,
          type: 'payment_failed' as any,
          data: {
            amount: `€${invoice.amount_due ? invoice.amount_due / 100 : 0}`,
            invoiceId: invoice.id,
            attemptCount: invoice.attempt_count || 1,
            nextPaymentAttempt: invoice.next_payment_attempt
          }
        });
      } catch (notificationError) {
        console.error('❌ Error sending payment failed notification:', notificationError);
      }
    }

    // Notificar al usuario sobre el fallo de pago
    // En producción, enviarías un email o notificación
    console.log(`⚠️ Notificar al usuario ${customerId} sobre fallo de pago`);
  }

  /**
   * Obtener plan desde Price ID
   */
  private getPlanFromPriceId(priceId?: string): string {
    switch (priceId) {
      case 'price_1SCLNc2ULfqKVBqVKXWa5Va4':
        return 'pro';
      case 'price_1SCLO32ULfqKVBqV0CitIdp0':
        return 'enterprise';
      default:
        return 'free';
    }
  }

  /**
   * Obtener precio del plan
   */
  private getPlanPrice(plan: string): string {
    switch (plan.toLowerCase()) {
      case 'pro':
        return '€49.00';
      case 'enterprise':
        return '€99.00';
      case 'starter':
        return '€19.00';
      default:
        return '€0.00';
    }
  }

  /**
 * Actualizar plan del usuario de prueba (fallback para testing)
 */
  private async updateTestUserPlan(plan: string, billingInfo: any): Promise<void> {
    try {
      console.log(`📝 Actualizando usuario de desarrollo al plan ${plan} en Supabase`);

      // Para desarrollo, actualizamos directamente el usuario logueado principal
      // En producción, esto debería usar el customer_id o user_id de los metadatos
      const { data, error } = await supabase
        .from('users')
        .update({
          plan: plan,

          subscription_id: billingInfo.subscriptionId,
          subscription_status: billingInfo.status,
          updated_at: new Date().toISOString()
        })
        .eq('email', 'juanmagp26@gmail.com') // Usuario real de desarrollo
        .select();

      if (error) {
        console.error('❌ Error actualizando usuario de desarrollo en Supabase:', error);

        // Fallback: buscar por cualquier usuario activo si no encuentra el específico
        console.log('🔄 Intentando fallback: actualizar primer usuario activo...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .update({
            plan: plan,

            subscription_id: billingInfo.subscriptionId,
            subscription_status: billingInfo.status,
            updated_at: new Date().toISOString()
          })
          .eq('is_active', true)
          .limit(1)
          .select();

        if (fallbackError) {
          console.error('❌ Error en fallback:', fallbackError);
          throw fallbackError;
        }

        console.log('✅ Usuario actualizado via fallback:', fallbackData);
        return;
      }

      console.log('✅ Usuario de desarrollo actualizado exitosamente en Supabase:', data);

      // 🔔 Enviar notificación de pago exitoso
      if (data && data[0]) {
        const user = data[0];
        console.log('📧 Enviando notificación de pago exitoso...');

        await notificationService.send({
          userId: user.id,
          type: 'payment_success',
          data: {
            amount: this.getPlanPrice(plan),
            plan: plan,
            customerId: billingInfo.customerId,
            subscriptionId: billingInfo.subscriptionId
          }
        });
      }

    } catch (error) {
      console.error('Error actualizando plan del usuario de desarrollo:', error);
      throw error;
    }
  }

  /**
   * Actualizar plan del usuario en Supabase
   */
  private async updateUserPlan(userId: string, plan: string, billingInfo: any): Promise<any> {
    try {
      console.log(`📝 Actualizando usuario ${userId} al plan ${plan} en Supabase`);

      // Actualizar en la tabla users
      const { data, error } = await supabase
        .from('users')
        .update({
          plan: plan,

          subscription_id: billingInfo.subscriptionId,
          subscription_status: billingInfo.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando usuario en Supabase:', error);
        throw error;
      }

      console.log('✅ Usuario actualizado exitosamente en Supabase:', data);

      // 🔔 Enviar notificación de cambio de plan
      if (data && data.id) {
        console.log('📧 Enviando notificación de cambio de plan...');

        await notificationService.send({
          userId: data.id,
          type: 'plan_change',
          data: {
            newPlan: plan,
            oldPlan: 'free', // En una implementación real, obtener el plan anterior
            customerId: billingInfo.customerId,
            subscriptionId: billingInfo.subscriptionId
          }
        });
      }

      return data;

    } catch (error) {
      console.error('Error actualizando plan del usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar plan por Customer ID - buscar usuario por stripe_customer_id
   */
  private async updateUserPlanByCustomerId(customerId: string, plan: string, billingInfo: any): Promise<any> {
    try {
      console.log(`� Buscando usuario con stripe_customer_id: ${customerId}`);

      // Buscar usuario por stripe_customer_id
      const { data: users, error: searchError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .limit(1);

      if (searchError) {
        console.error('❌ Error buscando usuario por customerId:', searchError);
        throw searchError;
      }

      if (!users || users.length === 0) {
        // Si no existe, actualizar todos los usuarios con el customerId (fallback para testing)
        console.log(`⚠️ Usuario no encontrado con customerId ${customerId}, usando fallback para testing`);

        const { data, error } = await supabase
          .from('users')
          .update({
            plan: plan,

            subscription_id: billingInfo.subscriptionId,
            subscription_status: billingInfo.status,
            updated_at: new Date().toISOString()
          })
          .eq('email', 'juangpdev@gmail.com') // Usuario real de desarrollo
          .select();

        if (error) {
          console.error('❌ Error en actualización fallback:', error);
          throw error;
        }

        console.log('✅ Actualización fallback exitosa:', data);
        return data?.[0] || null;
      }

      const userId = users[0].id;
      console.log(`✅ Usuario encontrado: ${userId}`);

      const updatedUser = await this.updateUserPlan(userId, plan, billingInfo);
      return updatedUser;

    } catch (error) {
      console.error('Error actualizando plan por customerId:', error);
      throw error;
    }
  }
}