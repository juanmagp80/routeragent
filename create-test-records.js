// Script temporal para insertar registros de prueba
async function createTestRecords() {
    try {
        console.log('🧪 Creando registros de prueba para actividad reciente...');

        const testRecords = [
            {
                api_key_id: '7699c14a-e882-4033-9486-01723f84242c',
                user_id: '3a942f65-25e7-4de3-84cb-3df0268ff759',
                model_used: 'GPT-4o',
                cost: 0.003,
                latency_ms: 1200,
                tokens_used: 150,
                prompt_preview: '¿Cuál es la mejor manera de optimizar React components para...',
                capabilities: ['text-generation', 'reasoning'],
                created_at: new Date().toISOString()
            },
            {
                api_key_id: '6781d0b7-59d8-47d6-92a1-4f6e8fcda38c',
                user_id: '3a942f65-25e7-4de3-84cb-3df0268ff759',
                model_used: 'Claude 3.5 Sonnet',
                cost: 0.002,
                latency_ms: 900,
                tokens_used: 120,
                prompt_preview: 'Explica el concepto de microservicios y sus ventajas en...',
                capabilities: ['text-generation', 'analysis'],
                created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
            },
            {
                api_key_id: '4684476f-945b-452b-abfa-379dc37ea52f',
                user_id: '3a942f65-25e7-4de3-84cb-3df0268ff759',
                model_used: 'Gemini Pro',
                cost: 0.001,
                latency_ms: 800,
                tokens_used: 100,
                prompt_preview: 'Crea una función JavaScript que valide emails usando regex...',
                capabilities: ['code-generation'],
                created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
            },
            {
                api_key_id: '780bd5b3-d979-4112-a92f-7868c2cce96a',
                user_id: '3a942f65-25e7-4de3-84cb-3df0268ff759',
                model_used: 'GPT-4o Mini',
                cost: 0.0005,
                latency_ms: 600,
                tokens_used: 80,
                prompt_preview: 'Traduce el siguiente texto al inglés: RouterAI es...',
                capabilities: ['translation', 'text-generation'],
                created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
            },
            {
                api_key_id: '7699c14a-e882-4033-9486-01723f84242c',
                user_id: '3a942f65-25e7-4de3-84cb-3df0268ff759',
                model_used: 'Grok Beta',
                cost: 0.004,
                latency_ms: 1500,
                tokens_used: 200,
                prompt_preview: 'Analiza las tendencias del mercado tecnológico para 2025...',
                capabilities: ['analysis', 'research'],
                created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
            }
        ];

        // Usar la API del backend en lugar de conectar directamente a Supabase
        for (const record of testRecords) {
            try {
                const response = await fetch('http://localhost:3002/v1/test-insert-usage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(record)
                });

                if (response.ok) {
                    console.log(`✅ Inserted record for ${record.model_used}`);
                } else {
                    console.log(`❌ Failed to insert record for ${record.model_used}`);
                }
            } catch (error) {
                console.error(`Error inserting record for ${record.model_used}:`, error.message);
            }
        }

        console.log('🎉 Proceso completado');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

createTestRecords();