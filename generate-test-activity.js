#!/usr/bin/env node

/**
 * Script para generar actividad de prueba usando la API de RouterAI
 * Uso: node generate-test-activity.js <API_KEY>
 */

const https = require('https');

// Configuración
const API_URL = 'http://localhost:3000'; // Cambia esto si tu app está en otro puerto
const API_ENDPOINT = '/api/v1/route';

// Prompts de prueba para generar diferentes tipos de actividad
const TEST_PROMPTS = [
  {
    input: "Explica brevemente qué es la inteligencia artificial",
    task_type: "general",
    priority: "cost"
  },
  {
    input: "Traduce al inglés: 'Buenos días, ¿cómo está usted?'",
    task_type: "translation",
    priority: "speed"
  },
  {
    input: "Escribe una función Python para calcular el factorial de un número",
    task_type: "code-generation",
    priority: "quality"
  },
  {
    input: "Resume en 3 líneas: El machine learning es una rama de la inteligencia artificial que permite a las computadoras aprender y mejorar automáticamente a través de la experiencia sin ser programadas explícitamente para cada tarea específica.",
    task_type: "summarization",
    priority: "cost"
  },
  {
    input: "Analiza las ventajas del trabajo remoto vs presencial",
    task_type: "analysis",
    priority: "quality"
  },
  {
    input: "Genera un email profesional para solicitar una reunión",
    task_type: "text-generation",
    priority: "speed"
  },
  {
    input: "Revisa este código y sugiere mejoras: function sum(a, b) { return a + b; }",
    task_type: "code-review",
    priority: "quality"
  },
  {
    input: "Traduce al francés: 'La tecnología avanza muy rápidamente'",
    task_type: "translation",
    priority: "cost"
  }
];

// Función para hacer una petición HTTP
function makeRequest(apiKey, promptData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(promptData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: API_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-API-Key': apiKey
      }
    };

    const req = require('http').request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: response,
            prompt: promptData.input.substring(0, 50) + '...'
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: { error: 'Invalid JSON response' },
            prompt: promptData.input.substring(0, 50) + '...'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        prompt: promptData.input.substring(0, 50) + '...'
      });
    });

    req.write(postData);
    req.end();
  });
}

// Función para añadir delay entre peticiones
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función principal
async function generateTestActivity(apiKey, numberOfCalls = 5) {
  console.log(`🚀 Iniciando generación de ${numberOfCalls} llamadas de prueba...`);
  console.log(`🔑 Usando API Key: ${apiKey.substring(0, 8)}***`);
  console.log(`🎯 Endpoint: ${API_URL}${API_ENDPOINT}`);
  console.log('');

  const results = [];
  let successCount = 0;
  let errorCount = 0;
  let totalCost = 0;
  let totalTime = 0;

  for (let i = 0; i < numberOfCalls; i++) {
    const promptData = TEST_PROMPTS[i % TEST_PROMPTS.length];
    
    console.log(`📤 [${i + 1}/${numberOfCalls}] Enviando: "${promptData.input.substring(0, 40)}..."`);
    console.log(`   Tipo: ${promptData.task_type} | Prioridad: ${promptData.priority}`);

    const startTime = Date.now();
    
    try {
      const result = await makeRequest(apiKey, promptData);
      const duration = Date.now() - startTime;
      
      if (result.status === 200) {
        successCount++;
        console.log(`✅ Éxito (${duration}ms)`);
        console.log(`   Modelo: ${result.data.selected_model || 'N/A'}`);
        console.log(`   Costo: $${result.data.cost?.toFixed(4) || '0.0000'}`);
        console.log(`   Proveedor: ${result.data.provider || 'N/A'}`);
        
        if (result.data.cost) totalCost += result.data.cost;
      } else {
        errorCount++;
        console.log(`❌ Error (${result.status}): ${result.data.error || 'Error desconocido'}`);
      }
      
      totalTime += duration;
      results.push({ ...result, duration });

    } catch (error) {
      const duration = Date.now() - startTime;
      errorCount++;
      console.log(`💥 Fallo de conexión (${duration}ms): ${error.error}`);
      totalTime += duration;
    }

    // Esperar entre peticiones para simular uso real
    if (i < numberOfCalls - 1) {
      console.log('⏳ Esperando 2 segundos...');
      console.log('');
      await delay(2000);
    }
  }

  // Mostrar resumen
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📊 RESUMEN DE LA PRUEBA');
  console.log('═══════════════════════════════════════');
  console.log(`Total de llamadas: ${numberOfCalls}`);
  console.log(`✅ Exitosas: ${successCount}`);
  console.log(`❌ Con error: ${errorCount}`);
  console.log(`💰 Costo total: $${totalCost.toFixed(4)}`);
  console.log(`⏱️  Tiempo promedio: ${Math.round(totalTime / numberOfCalls)}ms`);
  console.log(`🎯 Tasa de éxito: ${Math.round((successCount / numberOfCalls) * 100)}%`);
  console.log('');
  console.log('💡 Ve al dashboard (http://localhost:3000/admin) para ver la actividad reciente');
}

// Ejecutar el script
if (require.main === module) {
  const apiKey = process.argv[2];
  const numberOfCalls = parseInt(process.argv[3]) || 5;

  if (!apiKey) {
    console.log('❌ Error: Se requiere una API Key');
    console.log('');
    console.log('Uso:');
    console.log('  node generate-test-activity.js <API_KEY> [número_de_llamadas]');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node generate-test-activity.js ak_test_abc123 5');
    console.log('  node generate-test-activity.js ak_test_abc123 10');
    process.exit(1);
  }

  if (numberOfCalls < 1 || numberOfCalls > 20) {
    console.log('❌ Error: El número de llamadas debe estar entre 1 y 20');
    process.exit(1);
  }

  generateTestActivity(apiKey, numberOfCalls)
    .then(() => {
      console.log('🎉 Generación de actividad completada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}