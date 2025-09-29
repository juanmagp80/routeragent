import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tipos para las notificaciones
export interface NotificationEvent {
    userId: string;
    type: 'payment_success' | 'payment_failed' | 'plan_change' | 'usage_alert' | 'api_key_created' | 'welcome';
    data: {
        [key: string]: any;
    };
}

export interface NotificationTemplate {
    subject: string;
    html: string;
    slack: string;
    discord: string;
}

class NotificationService {
    private resend: Resend;

    constructor() {
        // Verificar que tenemos la API key antes de inicializar
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is required. Please check your environment variables.');
        }
        
        // Configurar Resend con API key
        this.resend = new Resend(apiKey);
        console.log('✅ NotificationService initialized with Resend');
    }

    // Método principal para enviar notificaciones
    async send(event: NotificationEvent): Promise<void> {
        try {
            console.log(`📢 Processing notification: ${event.type} for user ${event.userId}`);

            // Obtener datos del usuario
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', event.userId)
                .single();

            if (error || !user) {
                console.error('❌ User not found for notification:', error);
                return;
            }

            // Obtener template de la notificación
            const template = this.getTemplate(event.type, event.data, user);

            // Enviar por cada canal habilitado
            const promises = [];

            if (user.email_notifications) {
                promises.push(this.sendEmail(user.email, template, user.name));
            }

            // � Guardar notificación en la base de datos para mostrar en la página
            promises.push(this.saveNotificationToDatabase(event.userId, event.type, template, event.data));

            // �🚫 SLACK Y DISCORD DESHABILITADOS TEMPORALMENTE
            // if (user.slack_notifications && user.slack_webhook_url) {
            //     promises.push(this.sendSlack(user.slack_webhook_url, template));
            // }

            // if (user.discord_notifications && user.discord_webhook_url) {
            //     promises.push(this.sendDiscord(user.discord_webhook_url, template));
            // }

            await Promise.allSettled(promises);
            console.log(`✅ Notifications sent successfully for ${event.type} (email + database saved)`);

        } catch (error) {
            console.error('❌ Error sending notifications:', error);
        }
    }

    // Enviar email con Resend
    private async sendEmail(to: string, template: NotificationTemplate, userName: string): Promise<void> {
        try {
            console.log(`📧 Attempting to send email to: ${to}`);
            console.log(`📋 Template: ${template.subject}`);
            
            const { data, error } = await this.resend.emails.send({
                from: 'AgentRouter <onboarding@resend.dev>',  // Usar dominio por defecto de Resend
                to: [to],
                subject: template.subject,
                html: template.html
            });

            if (error) {
                console.error('❌ Error sending email with Resend:', error);
                throw error;
            }

            console.log(`📧 Email sent successfully via Resend to ${to}`, data);
        } catch (error) {
            console.error('❌ Error sending email:', error);
            throw error;
        }
    }

    // Enviar a Slack
    private async sendSlack(webhookUrl: string, template: NotificationTemplate): Promise<void> {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: template.slack,
                    username: 'AgentRouter',
                    icon_emoji: ':robot_face:'
                })
            });
            console.log('💬 Slack notification sent');
        } catch (error) {
            console.error('❌ Error sending Slack notification:', error);
        }
    }

    // Enviar a Discord
    private async sendDiscord(webhookUrl: string, template: NotificationTemplate): Promise<void> {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: template.discord,
                    username: 'AgentRouter',
                    avatar_url: 'https://via.placeholder.com/64x64/10b981/ffffff?text=AR'
                })
            });
            console.log('🎮 Discord notification sent');
        } catch (error) {
            console.error('❌ Error sending Discord notification:', error);
        }
    }

    // Obtener templates de notificaciones
    private getTemplate(type: string, data: any, user: any): NotificationTemplate {
        const templates: { [key: string]: NotificationTemplate } = {
            payment_success: {
                subject: '✅ Pago procesado exitosamente - AgentRouter',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 28px;">¡Pago Exitoso! 🎉</h1>
                        </div>
                        <div style="padding: 30px; background: #f9fafb;">
                            <p style="font-size: 16px; color: #374151;">Hola ${user.name || 'Usuario'},</p>
                            <p style="font-size: 16px; color: #374151;">
                                Tu pago de <strong>${data.amount || '€49.00'}</strong> ha sido procesado exitosamente.
                            </p>
                            <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <h2 style="margin: 0;">Plan ${(data.plan || 'Pro').toUpperCase()} Activado</h2>
                            </div>
                            <p style="font-size: 16px; color: #374151;">
                                Ya puedes disfrutar de todas las funciones premium de AgentRouter.
                            </p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://routeragent.onrender.com/admin" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Acceder al Dashboard
                                </a>
                            </div>
                        </div>
                        <div style="background: #6b7280; color: white; padding: 20px; text-align: center; font-size: 12px;">
                            AgentRouter - Tu enrutador inteligente de IA
                        </div>
                    </div>
                `,
                slack: `🎉 *Pago Exitoso!*\n\nHola ${user.name}, tu pago de ${data.amount || '€49.00'} ha sido procesado exitosamente.\n\n✅ *Plan ${(data.plan || 'Pro').toUpperCase()} Activado*\n\nYa puedes acceder a todas las funciones premium en: https://routeragent.onrender.com/admin`,
                discord: `🎉 **Pago Exitoso!**\n\nHola ${user.name}, tu pago de ${data.amount || '€49.00'} ha sido procesado exitosamente.\n\n✅ **Plan ${(data.plan || 'Pro').toUpperCase()} Activado**\n\nYa puedes acceder a todas las funciones premium: https://routeragent.onrender.com/admin`
            },

            plan_change: {
                subject: '🔄 Plan actualizado - AgentRouter',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 28px;">Plan Actualizado 🔄</h1>
                        </div>
                        <div style="padding: 30px; background: #f9fafb;">
                            <p style="font-size: 16px; color: #374151;">Hola ${user.name || 'Usuario'},</p>
                            <p style="font-size: 16px; color: #374151;">
                                Tu plan ha sido actualizado exitosamente.
                            </p>
                            <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <h2 style="margin: 0;">Nuevo Plan: ${(data.newPlan || 'Pro').toUpperCase()}</h2>
                            </div>
                            <p style="font-size: 16px; color: #374151;">
                                Los cambios han sido aplicados inmediatamente a tu cuenta.
                            </p>
                        </div>
                    </div>
                `,
                slack: `🔄 *Plan Actualizado*\n\nHola ${user.name}, tu plan ha sido actualizado a *${(data.newPlan || 'Pro').toUpperCase()}*.\n\nLos cambios están activos inmediatamente.`,
                discord: `🔄 **Plan Actualizado**\n\nHola ${user.name}, tu plan ha sido actualizado a **${(data.newPlan || 'Pro').toUpperCase()}**.\n\nLos cambios están activos inmediatamente.`
            },

            payment_failed: {
                subject: '⚠️ Problema con tu pago - AgentRouter',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 28px;">Problema con tu pago ⚠️</h1>
                        </div>
                        <div style="padding: 30px; background: #f9fafb;">
                            <p style="font-size: 16px; color: #374151;">Hola ${user.name || 'Usuario'},</p>
                            <p style="font-size: 16px; color: #374151;">
                                Hemos tenido un problema procesando tu pago de <strong>${data.amount || '€49.00'}</strong>.
                            </p>
                            <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <h2 style="margin: 0;">Pago Fallido</h2>
                                <p style="margin: 10px 0 0 0; font-size: 14px;">Intento ${data.attemptCount || 1}</p>
                            </div>
                            <p style="font-size: 16px; color: #374151;">
                                Por favor, verifica tu método de pago y actualiza tu información de facturación si es necesario.
                            </p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://routeragent.onrender.com/admin/billing" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Actualizar Método de Pago
                                </a>
                            </div>
                        </div>
                        <div style="background: #6b7280; color: white; padding: 20px; text-align: center; font-size: 12px;">
                            AgentRouter - Tu enrutador inteligente de IA
                        </div>
                    </div>
                `,
                slack: `⚠️ *Problema con tu Pago*\n\nHola ${user.name}, hemos tenido un problema procesando tu pago de ${data.amount || '€49.00'}.\n\n❌ *Pago Fallido* (Intento ${data.attemptCount || 1})\n\nPor favor actualiza tu método de pago: https://routeragent.onrender.com/admin/billing`,
                discord: `⚠️ **Problema con tu Pago**\n\nHola ${user.name}, hemos tenido un problema procesando tu pago de ${data.amount || '€49.00'}.\n\n❌ **Pago Fallido** (Intento ${data.attemptCount || 1})\n\nPor favor actualiza tu método de pago: https://routeragent.onrender.com/admin/billing`
            },

            welcome: {
                subject: '🎉 ¡Bienvenido a AgentRouter!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 28px;">¡Bienvenido a AgentRouter! 🎉</h1>
                        </div>
                        <div style="padding: 30px; background: #f9fafb;">
                            <p style="font-size: 16px; color: #374151;">Hola ${user.name || 'Usuario'},</p>
                            <p style="font-size: 16px; color: #374151;">
                                ¡Gracias por unirte a AgentRouter! Tu cuenta ha sido configurada exitosamente.
                            </p>
                            <p style="font-size: 16px; color: #374151;">
                                Ya puedes comenzar a usar nuestro enrutador inteligente de IA para optimizar tus consultas.
                            </p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://routeragent.onrender.com/admin" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Comenzar
                                </a>
                            </div>
                        </div>
                    </div>
                `,
                slack: `🎉 *¡Bienvenido a AgentRouter!*\n\nHola ${user.name}, tu cuenta ha sido configurada exitosamente.\n\nYa puedes comenzar a usar nuestro enrutador inteligente de IA: https://routeragent.onrender.com/admin`,
                discord: `🎉 **¡Bienvenido a AgentRouter!**\n\nHola ${user.name}, tu cuenta ha sido configurada exitosamente.\n\nYa puedes comenzar a usar nuestro enrutador inteligente de IA: https://routeragent.onrender.com/admin`
            },

            api_key_created: {
                subject: '🔑 Nueva API Key creada - AgentRouter',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 28px;">🔑 Nueva API Key Creada</h1>
                        </div>
                        <div style="padding: 30px; background: #f9fafb;">
                            <p style="font-size: 16px; color: #374151;">Hola ${user.name || 'Usuario'},</p>
                            <p style="font-size: 16px; color: #374151;">
                                Has creado exitosamente una nueva API key en tu cuenta de AgentRouter.
                            </p>
                            <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0;">Detalles de la API Key:</h3>
                                <p style="margin: 5px 0;"><strong>Nombre:</strong> ${data.keyName}</p>
                                <p style="margin: 5px 0;"><strong>Plan:</strong> ${(data.plan || 'free').toUpperCase()}</p>
                                <p style="margin: 5px 0;"><strong>Prefijo:</strong> ${data.keyPrefix}</p>
                            </div>
                            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                <p style="margin: 0; color: #92400e;">
                                    <strong>⚠️ Importante:</strong> Guarda tu API key en un lugar seguro. Por motivos de seguridad, no podrás verla nuevamente.
                                </p>
                            </div>
                            <p style="font-size: 16px; color: #374151;">
                                Ya puedes comenzar a integrar AgentRouter en tus aplicaciones.
                            </p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://routeragent.onrender.com/admin/keys" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Ver API Keys
                                </a>
                                <a href="https://routeragent.onrender.com/docs" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-left: 10px;">
                                    Ver Documentación
                                </a>
                            </div>
                        </div>
                        <div style="background: #6b7280; color: white; padding: 20px; text-align: center; font-size: 12px;">
                            AgentRouter - Tu enrutador inteligente de IA
                        </div>
                    </div>
                `,
                slack: `🔑 *Nueva API Key Creada*\n\nHola ${user.name}, has creado exitosamente una nueva API key:\n\n• *Nombre:* ${data.keyName}\n• *Plan:* ${(data.plan || 'free').toUpperCase()}\n• *Prefijo:* ${data.keyPrefix}\n\n⚠️ *Importante:* Guarda tu API key en un lugar seguro.\n\nVer API Keys: https://routeragent.onrender.com/admin/keys`,
                discord: `🔑 **Nueva API Key Creada**\n\nHola ${user.name}, has creado exitosamente una nueva API key:\n\n• **Nombre:** ${data.keyName}\n• **Plan:** ${(data.plan || 'free').toUpperCase()}\n• **Prefijo:** ${data.keyPrefix}\n\n⚠️ **Importante:** Guarda tu API key en un lugar seguro.\n\nVer API Keys: https://routeragent.onrender.com/admin/keys`
            },

            usage_alert: {
                subject: `⚠️ Alerta de uso de API Key - ${data.percentage || 80}% utilizado`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, ${data.percentage >= 100 ? '#dc2626' : data.percentage >= 95 ? '#ea580c' : '#f59e0b'}, ${data.percentage >= 100 ? '#b91c1c' : data.percentage >= 95 ? '#c2410c' : '#d97706'}); padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 28px;">⚠️ Alerta de Uso de API</h1>
                        </div>
                        <div style="padding: 30px; background: #f9fafb;">
                            <p style="font-size: 16px; color: #374151;">Hola ${user.name || 'Usuario'},</p>
                            <p style="font-size: 16px; color: #374151;">
                                Tu API key "<strong>${data.keyName}</strong>" ha alcanzado el <strong>${data.percentage || 80}%</strong> de su límite de uso.
                            </p>
                            <div style="background: ${data.percentage >= 100 ? '#fef2f2' : data.percentage >= 95 ? '#fef3c7' : '#fffbeb'}; border: 2px solid ${data.percentage >= 100 ? '#dc2626' : data.percentage >= 95 ? '#f59e0b' : '#f59e0b'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: ${data.percentage >= 100 ? '#dc2626' : data.percentage >= 95 ? '#ea580c' : '#f59e0b'};">Estado del Uso:</h3>
                                <p style="margin: 5px 0;"><strong>Uso actual:</strong> ${data.usageCount || 0} / ${data.usageLimit || 1000} requests</p>
                                <p style="margin: 5px 0;"><strong>Plan:</strong> ${(data.plan || 'free').toUpperCase()}</p>
                                <p style="margin: 5px 0;"><strong>Porcentaje usado:</strong> ${data.percentage || 80}%</p>
                                <div style="background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 10px 0;">
                                    <div style="background: ${data.percentage >= 100 ? '#dc2626' : data.percentage >= 95 ? '#ea580c' : '#f59e0b'}; height: 10px; width: ${Math.min(data.percentage || 80, 100)}%; transition: all 0.3s ease;"></div>
                                </div>
                            </div>
                            ${data.percentage >= 100 
                                ? `<div style="background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <p style="margin: 0; color: #dc2626;">
                                        <strong>🚫 Límite alcanzado:</strong> Tu API key ha sido temporalmente desactivada. Considera actualizar tu plan para continuar usando AgentRouter.
                                    </p>
                                   </div>`
                                : data.percentage >= 95
                                ? `<div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <p style="margin: 0; color: #92400e;">
                                        <strong>⚠️ Límite casi alcanzado:</strong> Te quedan muy pocas requests. Considera actualizar tu plan pronto.
                                    </p>
                                   </div>`
                                : `<div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <p style="margin: 0; color: #92400e;">
                                        <strong>💡 Recomendación:</strong> Has usado el 80% de tu límite. Considera monitorear tu uso o actualizar tu plan.
                                    </p>
                                   </div>`
                            }
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://routeragent.onrender.com/admin/keys" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Ver API Keys
                                </a>
                                ${data.percentage >= 80 
                                    ? `<a href="https://routeragent.onrender.com/admin/billing" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-left: 10px;">
                                        Actualizar Plan
                                       </a>`
                                    : ''
                                }
                            </div>
                        </div>
                        <div style="background: #6b7280; color: white; padding: 20px; text-align: center; font-size: 12px;">
                            AgentRouter - Tu enrutador inteligente de IA
                        </div>
                    </div>
                `,
                slack: `⚠️ *Alerta de Uso de API (${data.percentage || 80}%)*\n\nHola ${user.name}, tu API key "${data.keyName}" ha alcanzado el ${data.percentage || 80}% de su límite.\n\n📊 *Estado:*\n• Uso: ${data.usageCount || 0} / ${data.usageLimit || 1000} requests\n• Plan: ${(data.plan || 'free').toUpperCase()}\n• Usado: ${data.percentage || 80}%\n\n${data.percentage >= 100 ? '🚫 *Límite alcanzado* - API key desactivada' : data.percentage >= 95 ? '⚠️ *Límite casi alcanzado* - Quedan pocas requests' : '💡 *Recomendación* - Considera monitorear el uso'}\n\nVer API Keys: https://routeragent.onrender.com/admin/keys\n${data.percentage >= 80 ? 'Actualizar Plan: https://routeragent.onrender.com/admin/billing' : ''}`,
                discord: `⚠️ **Alerta de Uso de API (${data.percentage || 80}%)**\n\nHola ${user.name}, tu API key "${data.keyName}" ha alcanzado el ${data.percentage || 80}% de su límite.\n\n📊 **Estado:**\n• Uso: ${data.usageCount || 0} / ${data.usageLimit || 1000} requests\n• Plan: ${(data.plan || 'free').toUpperCase()}\n• Usado: ${data.percentage || 80}%\n\n${data.percentage >= 100 ? '🚫 **Límite alcanzado** - API key desactivada' : data.percentage >= 95 ? '⚠️ **Límite casi alcanzado** - Quedan pocas requests' : '💡 **Recomendación** - Considera monitorear el uso'}\n\nVer API Keys: https://routeragent.onrender.com/admin/keys\n${data.percentage >= 80 ? 'Actualizar Plan: https://routeragent.onrender.com/admin/billing' : ''}`
            }
        };

        return templates[type] || templates.welcome;
    }

    // 🚫 SLACK DESHABILITADO TEMPORALMENTE
    // Validar webhook de Slack
    async validateSlackWebhook(webhookUrl: string): Promise<boolean> {
        // return false; // Siempre falla porque está deshabilitado
        console.log('⚠️ Slack notifications disabled');
        return false;
        // try {
        //     const response = await fetch(webhookUrl, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             text: '✅ Webhook de AgentRouter configurado correctamente',
        //             username: 'AgentRouter Test'
        //         })
        //     });
        //     return response.ok;
        // } catch {
        //     return false;
        // }
    }

    // 🚫 DISCORD DESHABILITADO TEMPORALMENTE
    // Validar webhook de Discord
    async validateDiscordWebhook(webhookUrl: string): Promise<boolean> {
        // return false; // Siempre falla porque está deshabilitado
        console.log('⚠️ Discord notifications disabled');
        return false;
        // try {
        //     const response = await fetch(webhookUrl, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             content: '✅ Webhook de AgentRouter configurado correctamente',
        //             username: 'AgentRouter Test'
        //         })
        //     });
        //     return response.ok;
        // } catch {
        //     return false;
        // }
    }

    // 💾 Guardar notificación en la base de datos para mostrar en la página
    private async saveNotificationToDatabase(userId: string, type: string, template: NotificationTemplate, data: any): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: userId,
                    type: type,
                    title: template.subject,
                    message: this.extractTextFromHtml(template.html),
                    data: data,
                    is_read: false,
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('❌ Error saving notification to database:', error);
            } else {
                console.log(`💾 Notification saved to database for user ${userId}`);
            }
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
        }
    }

    // 🔧 Extraer texto limpio del HTML para mostrar en la página
    private extractTextFromHtml(html: string): string {
        // Remover tags HTML y obtener solo el texto
        return html
            .replace(/<[^>]*>/g, ' ')           // Remover tags HTML
            .replace(/\s+/g, ' ')               // Reemplazar múltiples espacios por uno
            .replace(/&nbsp;/g, ' ')            // Reemplazar &nbsp; por espacio
            .replace(/&amp;/g, '&')             // Reemplazar &amp; por &
            .replace(/&lt;/g, '<')              // Reemplazar &lt; por <
            .replace(/&gt;/g, '>')              // Reemplazar &gt; por >
            .trim()                             // Remover espacios al inicio y final
            .substring(0, 500);                 // Limitar a 500 caracteres
    }
}

export const notificationService = new NotificationService();