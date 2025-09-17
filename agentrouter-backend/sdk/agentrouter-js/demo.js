/**
 * Demo of AgentRouter SDK
 * Run with: node demo.js
 */

// Import the SDK
const AgentRouterModule = require('./index.js');
const AgentRouter = AgentRouterModule.default || AgentRouterModule;

// Use the API key we created earlier
const API_KEY = 'ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a';

async function runDemo() {
    console.log('🚀 AgentRouter SDK Demo');
    console.log('========================\n');

    try {
        // Initialize the router
        console.log('1. Initializing AgentRouter...');
        const router = new AgentRouter(API_KEY, {
            baseUrl: 'http://localhost:3001',
            timeout: 30000,
            retries: 3
        });
        console.log('✅ SDK initialized\n');

        // Get version
        console.log('2. SDK Version:');
        console.log(`   Version: ${AgentRouter.getVersion()}\n`);

        // Validate API key
        console.log('3. Validating API Key...');
        const validation = await router.validateKey();
        if (validation.valid) {
            console.log('✅ API key is valid');
            console.log(`   Plan: ${validation.key_info.plan}`);
            console.log(`   Usage: ${validation.key_info.usage_count}/${validation.key_info.usage_limit}\n`);
        } else {
            console.log('❌ API key is invalid\n');
            return;
        }

        // Simple question
        console.log('4. Asking a simple question...');
        const questionResponse = await router.route({
            input: 'What are the main benefits of using artificial intelligence in business?',
            taskType: 'general'
        });

        console.log('✅ Question answered');
        console.log(`   Model used: ${questionResponse.selected_model}`);
        console.log(`   Cost: $${questionResponse.cost.toFixed(6)}`);
        console.log(`   Response: ${questionResponse.response.substring(0, 100)}...\n`);

        // Document summary
        console.log('5. Summarizing a document...');
        const longDocument = `
Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence 
displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": 
any device that perceives its environment and takes actions that maximize its chance of successfully achieving 
its goals. Colloquially, the term "artificial intelligence" is often used to describe machines that mimic 
"cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".

As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the 
definition of AI, a phenomenon known as the AI effect. A quip in Tesler's Theorem says "AI is whatever hasn't 
been done yet." For instance, optical character recognition is frequently excluded from things considered to 
be AI, having become a routine technology. Modern machine learning techniques are a core part of AI. Machine 
learning algorithms build a model based on sample data, known as "training data", in order to make predictions 
or decisions without being explicitly programmed to do so.

AI applications include advanced web search engines, recommendation systems, understanding human speech, 
self-driving cars, automated decision-making and competing at the highest level in strategic game systems. 
As machines become increasingly capable, mental facilities once thought to require intelligence are removed 
from the definition. For example, optical character recognition is no longer perceived as an example of 
"artificial intelligence", having become a routine technology.
    `.trim();

        const summaryResponse = await router.route({
            input: longDocument,
            taskType: 'summary'
        });

        console.log('✅ Document summarized');
        console.log(`   Model used: ${summaryResponse.selected_model}`);
        console.log(`   Cost: $${summaryResponse.cost.toFixed(6)}`);
        console.log(`   Summary: ${summaryResponse.response}\n`);

        // Translation
        console.log('6. Translating text...');
        const translationResponse = await router.route({
            input: 'Hello, how are you today? I hope you are doing well.',
            taskType: 'translation'
        });

        console.log('✅ Text translated');
        console.log(`   Model used: ${translationResponse.selected_model}`);
        console.log(`   Cost: $${translationResponse.cost.toFixed(6)}`);
        console.log(`   Translation: ${translationResponse.response}\n`);

        // Get metrics
        console.log('7. Getting usage metrics...');
        const metrics = await router.getMetrics();

        console.log('✅ Metrics retrieved');
        console.log(`   Total cost: $${metrics.summary.total_cost.toFixed(4)}`);
        console.log(`   Total requests: ${metrics.summary.total_requests}`);
        console.log(`   Average cost per request: $${metrics.summary.avg_cost_per_request.toFixed(6)}\n`);

        // Batch processing
        console.log('8. Batch processing multiple tasks...');
        const batchTasks = [
            { input: 'What is machine learning?', taskType: 'general' },
            { input: 'Summarize: The quick brown fox jumps over the lazy dog.', taskType: 'summary' },
            { input: 'Translate to Spanish: Good morning', taskType: 'translation' }
        ];

        const batchResults = await router.batchRoute(batchTasks);

        console.log('✅ Batch processing completed');
        batchResults.forEach((result, index) => {
            console.log(`   Task ${index + 1}: ${result.selected_model} - $${result.cost.toFixed(6)}`);
        });
        console.log('');

        // Performance stats
        console.log('9. Getting performance statistics...');
        const performance = await router.getPerformanceStats();

        console.log('✅ Performance stats retrieved');
        console.log(`   Cache size: ${performance.cache_stats.size}`);
        console.log(`   Cache hit rate: ${(performance.cache_stats.hitRate * 100).toFixed(1)}%`);
        console.log(`   Available models: ${performance.model_stats.available_models.length}`);
        console.log(`   Available providers: ${performance.model_stats.provider_stats.available_providers.join(', ')}\n`);

        console.log('🎉 Demo completed successfully!');
        console.log('\n💡 Cost Savings Example:');
        console.log('   Without AgentRouter: $0.03 per request (GPT-4)');
        console.log('   With AgentRouter: $0.0008 per request (GPT-4o Mini)');
        console.log('   Savings: 97.3%!');

    } catch (error) {
        console.error('❌ Error in demo:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

// Run the demo
if (require.main === module) {
    runDemo();
}

module.exports = { runDemo };