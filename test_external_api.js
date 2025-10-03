#!/usr/bin/env node
/**
 * RouterAI API External Test Suite
 * Prueba los endpoints desde un sistema externo usando Node.js
 */

const https = require('https');
const http = require('http');

// Configuración
const BASE_URL = 'http://localhost:3000';
const API_KEY = 'ar_your_api_key_here'; // Reemplaza con tu API key real

/**
 * Hacer request HTTP
 */
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const protocol = options.protocol === 'https:' ? https : http;

        const req = protocol.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Probar endpoint /api/v1/route
 */
async function testRouteEndpoint() {
    console.log('🧪 Probando endpoint /api/v1/route...');

    const url = new URL('/api/v1/route', BASE_URL);

    const testCases = [
        {
            name: 'Consulta General',
            data: {
                input: '¿Cuál es la capital de España?',
                task_type: 'general'
            }
        },
        {
            name: 'Análisis',
            data: {
                input: 'Analiza las ventajas y desventajas del trabajo remoto en el sector tecnológico.',
                task_type: 'analysis'
            }
        },
        {
            name: 'Resumen',
            data: {
                input: 'RouterAI es una plataforma innovadora que revoluciona el uso de inteligencia artificial mediante enrutamiento inteligente de modelos. Esta tecnología permite a las empresas optimizar significativamente sus costos operativos al seleccionar automáticamente el modelo de IA más eficiente para cada tarea específica, resultando en ahorros de hasta el 95% en comparación con el uso exclusivo de modelos premium.',
                task_type: 'summary'
            }
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📋 Test: ${testCase.name}`);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/v1/route',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        };

        try {
            const result = await makeRequest(options, testCase.data);

            console.log(`Status Code: ${result.statusCode}`);

            if (result.statusCode === 200) {
                const data = result.data;
                console.log('✅ Éxito:');
                console.log(`  - Modelo: ${data.selected_model || 'N/A'}`);
                console.log(`  - Costo: $${(data.cost || 0).toFixed(6)}`);
                console.log(`  - Tiempo: ${data.estimated_time || 0}ms`);
                console.log(`  - Respuesta: ${(data.response || 'N/A').substring(0, 100)}...`);

                if (data.routing_reason) {
                    console.log(`  - Razón: ${data.routing_reason}`);
                }
            } else {
                console.log(`❌ Error: ${JSON.stringify(result.data)}`);
            }

        } catch (error) {
            console.log(`❌ Error de conexión: ${error.message}`);
        }

        // Pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

/**
 * Probar endpoint /api/v1/metrics
 */
async function testMetricsEndpoint() {
    console.log('\n🧪 Probando endpoint /api/v1/metrics...');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/metrics',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    try {
        const result = await makeRequest(options);

        console.log(`Status Code: ${result.statusCode}`);

        if (result.statusCode === 200) {
            const data = result.data;
            console.log('✅ Métricas obtenidas:');

            // Resumen
            if (data.summary) {
                const summary = data.summary;
                console.log(`  📊 Total requests: ${summary.total_requests || 0}`);
                console.log(`  💰 Costo total: $${(summary.total_cost || 0).toFixed(6)}`);
                console.log(`  📈 Costo promedio: $${(summary.avg_cost_per_request || 0).toFixed(6)}`);
            }

            // Modelos más usados
            if (data.metrics && data.metrics.length > 0) {
                console.log('  🤖 Modelos más usados:');
                data.metrics.slice(0, 3).forEach(metric => {
                    console.log(`    - ${metric.model}: ${metric.count} requests ($${(metric.sum || 0).toFixed(3)})`);
                });
            }

        } else {
            console.log(`❌ Error: ${JSON.stringify(result.data)}`);
        }

    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
    }
}

/**
 * Verificar conectividad
 */
async function testApiHealth() {
    console.log('🏥 Verificando conectividad...');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/metrics',
        method: 'GET',
        timeout: 5000
    };

    try {
        const result = await makeRequest(options);

        if ([200, 401].includes(result.statusCode)) {
            console.log('✅ API está respondiendo');
            return true;
        } else {
            console.log(`❌ API respondió con código: ${result.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ No se puede conectar: ${error.message}`);
        console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
        return false;
    }
}

/**
 * Función principal
 */
async function main() {
    console.log('🚀 RouterAI API External Test Suite (Node.js)');
    console.log('='.repeat(50));

    // Verificar conectividad
    const isHealthy = await testApiHealth();
    if (!isHealthy) {
        console.log('\n❌ No se puede continuar sin conexión a la API');
        process.exit(1);
    }

    // Ejecutar pruebas
    await testRouteEndpoint();
    await testMetricsEndpoint();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Pruebas completadas!');
    console.log('\n💡 Tips:');
    console.log('- Reemplaza "ar_your_api_key_here" con tu API key real');
    console.log('- Asegúrate de que Next.js esté corriendo: npm run dev');
    console.log('- Revisa el dashboard para ver las métricas actualizadas');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testRouteEndpoint,
    testMetricsEndpoint,
    testApiHealth
};