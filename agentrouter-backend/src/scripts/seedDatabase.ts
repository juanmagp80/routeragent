import { supabase } from '../config/database';

async function seedDatabase() {
    console.log('Seeding database with sample data...');

    try {
        // Insertar usuarios de ejemplo
        const users = [
            {
                id: '1',
                email: 'john@example.com',
                name: 'John Developer',
                plan: 'pro',
                api_key_limit: 10,
                usage_limit: 10000,
                usage_count: 2450,
                is_active: true,
                email_verified: true,
                created_at: '2023-01-15T09:30:00Z',
                updated_at: '2023-06-20T14:45:00Z',
                last_login: '2023-06-20T14:45:00Z',
                two_factor_enabled: false,
                failed_login_attempts: 0,
                roles: ['admin'],
                permissions: ['read:users', 'write:users', 'read:api_keys', 'write:api_keys'],
                company: 'Tech Corp',
                timezone: 'Europe/Madrid',
                language: 'en'
            },
            {
                id: '2',
                email: 'sarah@example.com',
                name: 'Sarah Manager',
                plan: 'pro',
                api_key_limit: 5,
                usage_limit: 5000,
                usage_count: 1200,
                is_active: true,
                email_verified: true,
                created_at: '2023-02-10T11:20:00Z',
                updated_at: '2023-06-19T09:15:00Z',
                last_login: '2023-06-19T09:15:00Z',
                two_factor_enabled: false,
                failed_login_attempts: 0,
                roles: ['manager'],
                permissions: ['read:users', 'read:api_keys'],
                company: 'Tech Corp',
                timezone: 'Europe/Madrid',
                language: 'en'
            },
            {
                id: '3',
                email: 'mike@example.com',
                name: 'Mike Analyst',
                plan: 'starter',
                api_key_limit: 2,
                usage_limit: 1000,
                usage_count: 850,
                is_active: false,
                email_verified: true,
                created_at: '2023-03-05T16:40:00Z',
                updated_at: '2023-05-15T10:30:00Z',
                last_login: '2023-05-15T10:30:00Z',
                two_factor_enabled: false,
                failed_login_attempts: 0,
                roles: ['user'],
                permissions: ['read:api_keys'],
                company: 'Tech Corp',
                timezone: 'Europe/Madrid',
                language: 'en'
            }
        ];

        for (const user of users) {
            const { error } = await supabase
                .from('users')
                .insert([user]);

            if (error) {
                console.error('Error inserting user:', error);
            } else {
                console.log(`User ${user.name} inserted successfully`);
            }
        }

        // Insertar claves API de ejemplo
        const apiKeys = [
            {
                user_id: '1',
                key_prefix: 'ar_abc123',
                key_hash: 'hashed_key_1',
                name: 'Development Key',
                description: 'Key for development environment',
                is_active: true,
                usage_limit: 1000,
                usage_count: 450,
                created_at: '2023-01-15T09:30:00Z',
                updated_at: '2023-06-20T14:45:00Z',
                expires_at: '2024-01-15T09:30:00Z',
                last_used_at: '2023-06-20T14:45:00Z',
                permissions: ['read:api_keys', 'write:api_keys']
            },
            {
                user_id: '1',
                key_prefix: 'ar_def456',
                key_hash: 'hashed_key_2',
                name: 'Production Key',
                description: 'Key for production environment',
                is_active: true,
                usage_limit: 5000,
                usage_count: 1200,
                created_at: '2023-02-10T11:20:00Z',
                updated_at: '2023-06-19T09:15:00Z',
                expires_at: '2024-02-10T11:20:00Z',
                last_used_at: '2023-06-19T09:15:00Z',
                permissions: ['read:api_keys']
            },
            {
                user_id: '2',
                key_prefix: 'ar_ghi789',
                key_hash: 'hashed_key_3',
                name: 'Analytics Key',
                description: 'Key for analytics dashboard',
                is_active: true,
                usage_limit: 2000,
                usage_count: 850,
                created_at: '2023-03-05T16:40:00Z',
                updated_at: '2023-05-15T10:30:00Z',
                expires_at: '2024-03-05T16:40:00Z',
                last_used_at: '2023-05-15T10:30:00Z',
                permissions: ['read:api_keys']
            }
        ];

        for (const apiKey of apiKeys) {
            const { error } = await supabase
                .from('api_keys')
                .insert([apiKey]);

            if (error) {
                console.error('Error inserting API key:', error);
            } else {
                console.log(`API key ${apiKey.name} inserted successfully`);
            }
        }

        // Insertar registros de uso de ejemplo
        const usageRecords = [
            {
                user_id: '1',
                api_key_id: '1',
                model_used: 'gpt-4',
                cost: 0.023,
                latency_ms: 89,
                tokens_used: 150,
                prompt_preview: 'Resumen del documento...',
                capabilities: ['summary'],
                created_at: '2023-06-20T14:45:00Z'
            },
            {
                user_id: '1',
                api_key_id: '1',
                model_used: 'claude-3',
                cost: 0.015,
                latency_ms: 156,
                tokens_used: 200,
                prompt_preview: 'Traducción del texto...',
                capabilities: ['translation'],
                created_at: '2023-06-19T09:15:00Z'
            },
            {
                user_id: '2',
                api_key_id: '3',
                model_used: 'mistral-7b',
                cost: 0.002,
                latency_ms: 167,
                tokens_used: 100,
                prompt_preview: 'Análisis de datos...',
                capabilities: ['analysis'],
                created_at: '2023-05-15T10:30:00Z'
            }
        ];

        for (const usageRecord of usageRecords) {
            const { error } = await supabase
                .from('usage_records')
                .insert([usageRecord]);

            if (error) {
                console.error('Error inserting usage record:', error);
            } else {
                console.log(`Usage record for ${usageRecord.model_used} inserted successfully`);
            }
        }

        // Insertar tareas de ejemplo
        const tasks = [
            {
                user_id: '1',
                api_key_id: '1',
                task_type: 'summary',
                input: 'Documento largo...',
                output: 'Resumen del documento...',
                model_selected: 'gpt-4',
                cost: 0.023,
                latency_ms: 89,
                tokens_used: 150,
                status: 'completed',
                created_at: '2023-06-20T14:45:00Z',
                updated_at: '2023-06-20T14:45:00Z',
                completed_at: '2023-06-20T14:45:00Z'
            },
            {
                user_id: '1',
                api_key_id: '1',
                task_type: 'translation',
                input: 'Texto en inglés...',
                output: 'Texto traducido...',
                model_selected: 'claude-3',
                cost: 0.015,
                latency_ms: 156,
                tokens_used: 200,
                status: 'completed',
                created_at: '2023-06-19T09:15:00Z',
                updated_at: '2023-06-19T09:15:00Z',
                completed_at: '2023-06-19T09:15:00Z'
            },
            {
                user_id: '2',
                api_key_id: '3',
                task_type: 'analysis',
                input: 'Datos de ventas...',
                output: 'Análisis de datos...',
                model_selected: 'mistral-7b',
                cost: 0.002,
                latency_ms: 167,
                tokens_used: 100,
                status: 'completed',
                created_at: '2023-05-15T10:30:00Z',
                updated_at: '2023-05-15T10:30:00Z',
                completed_at: '2023-05-15T10:30:00Z'
            }
        ];

        for (const task of tasks) {
            const { error } = await supabase
                .from('tasks')
                .insert([task]);

            if (error) {
                console.error('Error inserting task:', error);
            } else {
                console.log(`Task ${task.task_type} inserted successfully`);
            }
        }

        // Insertar métricas de rendimiento de ejemplo
        const performanceMetrics = [
            {
                model: 'gpt-4',
                provider: 'openai',
                task_type: 'summary',
                avg_latency_ms: 89.5,
                avg_cost_per_task: 0.023,
                success_rate: 0.98,
                sample_size: 100,
                recorded_at: '2023-06-20T14:45:00Z'
            },
            {
                model: 'claude-3',
                provider: 'anthropic',
                task_type: 'translation',
                avg_latency_ms: 156.2,
                avg_cost_per_task: 0.015,
                success_rate: 0.95,
                sample_size: 80,
                recorded_at: '2023-06-19T09:15:00Z'
            },
            {
                model: 'mistral-7b',
                provider: 'mistral',
                task_type: 'analysis',
                avg_latency_ms: 167.8,
                avg_cost_per_task: 0.002,
                success_rate: 0.92,
                sample_size: 60,
                recorded_at: '2023-05-15T10:30:00Z'
            }
        ];

        for (const metric of performanceMetrics) {
            const { error } = await supabase
                .from('performance_metrics')
                .insert([metric]);

            if (error) {
                console.error('Error inserting performance metric:', error);
            } else {
                console.log(`Performance metric for ${metric.model} inserted successfully`);
            }
        }

        // Insertar suscripciones de ejemplo
        const subscriptions = [
            {
                user_id: '1',
                plan: 'pro',
                status: 'active',
                start_date: '2023-01-15T09:30:00Z',
                end_date: '2024-01-15T09:30:00Z',
                created_at: '2023-01-15T09:30:00Z',
                updated_at: '2023-06-20T14:45:00Z'
            },
            {
                user_id: '2',
                plan: 'pro',
                status: 'active',
                start_date: '2023-02-10T11:20:00Z',
                end_date: '2024-02-10T11:20:00Z',
                created_at: '2023-02-10T11:20:00Z',
                updated_at: '2023-06-19T09:15:00Z'
            },
            {
                user_id: '3',
                plan: 'starter',
                status: 'inactive',
                start_date: '2023-03-05T16:40:00Z',
                end_date: '2024-03-05T16:40:00Z',
                created_at: '2023-03-05T16:40:00Z',
                updated_at: '2023-05-15T10:30:00Z'
            }
        ];

        for (const subscription of subscriptions) {
            const { error } = await supabase
                .from('subscriptions')
                .insert([subscription]);

            if (error) {
                console.error('Error inserting subscription:', error);
            } else {
                console.log(`Subscription for user ${subscription.user_id} inserted successfully`);
            }
        }

        // Insertar facturas de ejemplo
        const invoices = [
            {
                user_id: '1',
                subscription_id: '1',
                amount: 99.00,
                currency: 'USD',
                status: 'paid',
                invoice_date: '2023-06-01T00:00:00Z',
                due_date: '2023-06-15T00:00:00Z',
                paid_at: '2023-06-05T00:00:00Z',
                created_at: '2023-06-01T00:00:00Z',
                updated_at: '2023-06-05T00:00:00Z'
            },
            {
                user_id: '2',
                subscription_id: '2',
                amount: 99.00,
                currency: 'USD',
                status: 'paid',
                invoice_date: '2023-06-01T00:00:00Z',
                due_date: '2023-06-15T00:00:00Z',
                paid_at: '2023-06-03T00:00:00Z',
                created_at: '2023-06-01T00:00:00Z',
                updated_at: '2023-06-03T00:00:00Z'
            }
        ];

        for (const invoice of invoices) {
            const { error } = await supabase
                .from('invoices')
                .insert([invoice]);

            if (error) {
                console.error('Error inserting invoice:', error);
            } else {
                console.log(`Invoice for user ${invoice.user_id} inserted successfully`);
            }
        }

        // Insertar notificaciones de ejemplo
        const notifications = [
            {
                user_id: '1',
                type: 'info',
                title: 'Bienvenido',
                message: 'Bienvenido a AgentRouter',
                read: false,
                created_at: '2023-01-15T09:30:00Z'
            },
            {
                user_id: '2',
                type: 'warning',
                title: 'Límite de uso',
                message: 'Has alcanzado el 80% de tu límite de uso mensual',
                read: false,
                created_at: '2023-06-19T09:15:00Z'
            }
        ];

        for (const notification of notifications) {
            const { error } = await supabase
                .from('notifications')
                .insert([notification]);

            if (error) {
                console.error('Error inserting notification:', error);
            } else {
                console.log(`Notification for user ${notification.user_id} inserted successfully`);
            }
        }

        // Insertar modelos de IA de ejemplo
        const aiModels = [
            {
                name: 'gpt-4',
                provider: 'openai',
                cost_per_token: 0.03,
                max_tokens: 128000,
                speed_rating: 8,
                quality_rating: 9,
                availability: true,
                supported_tasks: ['summary', 'translation', 'analysis', 'general'],
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-06-20T14:45:00Z'
            },
            {
                name: 'claude-3',
                provider: 'anthropic',
                cost_per_token: 0.015,
                max_tokens: 200000,
                speed_rating: 7,
                quality_rating: 8,
                availability: true,
                supported_tasks: ['summary', 'translation', 'analysis', 'general'],
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-06-19T09:15:00Z'
            },
            {
                name: 'mistral-7b',
                provider: 'mistral',
                cost_per_token: 0.002,
                max_tokens: 32000,
                speed_rating: 9,
                quality_rating: 7,
                availability: true,
                supported_tasks: ['summary', 'translation', 'general'],
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-05-15T10:30:00Z'
            },
            {
                name: 'llama-3',
                provider: 'meta',
                cost_per_token: 0.001,
                max_tokens: 8000,
                speed_rating: 6,
                quality_rating: 6,
                availability: true,
                supported_tasks: ['summary', 'translation', 'general'],
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-05-15T10:30:00Z'
            }
        ];

        for (const model of aiModels) {
            const { error } = await supabase
                .from('ai_models')
                .insert([model]);

            if (error) {
                console.error('Error inserting AI model:', error);
            } else {
                console.log(`AI model ${model.name} inserted successfully`);
            }
        }

        // Insertar proveedores de IA de ejemplo
        const aiProviders = [
            {
                name: 'openai',
                api_endpoint: 'https://api.openai.com/v1/chat/completions',
                api_key: 'YOUR_OPENAI_API_KEY',
                is_active: true,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-06-20T14:45:00Z'
            },
            {
                name: 'anthropic',
                api_endpoint: 'https://api.anthropic.com/v1/messages',
                api_key: 'YOUR_ANTHROPIC_API_KEY',
                is_active: true,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-06-19T09:15:00Z'
            },
            {
                name: 'mistral',
                api_endpoint: 'https://api.mistral.ai/v1/chat/completions',
                api_key: 'YOUR_MISTRAL_API_KEY',
                is_active: true,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-05-15T10:30:00Z'
            },
            {
                name: 'meta',
                api_endpoint: 'https://api.meta.com/v1/chat/completions',
                api_key: 'YOUR_META_API_KEY',
                is_active: true,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-05-15T10:30:00Z'
            }
        ];

        for (const provider of aiProviders) {
            const { error } = await supabase
                .from('ai_providers')
                .insert([provider]);

            if (error) {
                console.error('Error inserting AI provider:', error);
            } else {
                console.log(`AI provider ${provider.name} inserted successfully`);
            }
        }

        // Insertar configuraciones de ruteo de ejemplo
        const routingConfigs = [
            {
                model_id: '1',
                task_type: 'summary',
                weight: 0.25,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-06-20T14:45:00Z'
            },
            {
                model_id: '2',
                task_type: 'summary',
                weight: 0.25,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-06-19T09:15:00Z'
            },
            {
                model_id: '3',
                task_type: 'summary',
                weight: 0.25,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-05-15T10:30:00Z'
            },
            {
                model_id: '4',
                task_type: 'summary',
                weight: 0.25,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-05-15T10:30:00Z'
            }
        ];

        for (const config of routingConfigs) {
            const { error } = await supabase
                .from('routing_config')
                .insert([config]);

            if (error) {
                console.error('Error inserting routing config:', error);
            } else {
                console.log(`Routing config for model ${config.model_id} inserted successfully`);
            }
        }

        console.log('Database seeding completed');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// Ejecutar el seeding si se llama directamente
if (require.main === module) {
    seedDatabase();
}

export default seedDatabase;