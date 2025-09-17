/**
 * Example usage of AgentRouter SDK
 * Run with: node example.js
 */

// Import the SDK (works in Node.js)
const AgentRouter = require('./index.js');

// Replace with your actual API key
const API_KEY = 'ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a';

async function runExample() {
    try {
        console.log('🚀 Initializing AgentRouter SDK...');

        // Initialize the router
        const router = new AgentRouter(API_KEY, {
            timeout: 30000,
            retries: 3
        });

        console.log('✅ SDK initialized successfully\n');

        // Example 1: Simple general question
        console.log('📝 Example 1: General Question');
        const generalResponse = await router.route({
            input: 'What are the benefits of using artificial intelligence in business?',
            taskType: 'general'
        });

        console.log('Response:', generalResponse.response);
        console.log('Model used:', generalResponse.selected_model);
        console.log('Cost:', `$${generalResponse.cost.toFixed(6)}`);
        console.log('Time:', `${generalResponse.estimated_time}ms`);
        console.log('Real AI:', generalResponse.is_real_ai);
        console.log('');

        // Example 2: Document summary
        console.log('📝 Example 2: Document Summary');
        const summaryResponse = await router.route({
            input: 'Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. Colloquially, the term "artificial intelligence" is often used to describe machines that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".',
            taskType: 'summary'
        });

        console.log('Summary:', summaryResponse.response);
        console.log('Model used:', summaryResponse.selected_model);
        console.log('Cost:', `$${summaryResponse.cost.toFixed(6)}`);
        console.log('Time:', `${summaryResponse.estimated_time}ms`);
        console.log('');

        // Example 3: Translation
        console.log('📝 Example 3: Translation');
        const translationResponse = await router.route({
            input: 'Hello, how are you today?',
            taskType: 'translation'
        });

        console.log('Translation:', translationResponse.response);
        console.log('Model used:', translationResponse.selected_model);
        console.log('Cost:', `$${translationResponse.cost.toFixed(6)}`);
        console.log('Time:', `${translationResponse.estimated_time}ms`);
        console.log('');

        // Example 4: Get metrics
        console.log('📊 Example 4: Get Metrics');
        const metrics = await router.getMetrics();
        console.log('Total cost:', `$${metrics.summary.total_cost.toFixed(4)}`);
        console.log('Total requests:', metrics.summary.total_requests);
        console.log('Average cost per request:', `$${metrics.summary.avg_cost_per_request.toFixed(6)}`);
        console.log('');

        // Example 5: Validate API key
        console.log('🔐 Example 5: Validate API Key');
        const validation = await router.validateKey();
        console.log('API key valid:', validation.valid);
        if (validation.key_info) {
            console.log('Plan:', validation.key_info.plan);
            console.log('Usage:', `${validation.key_info.usage_count}/${validation.key_info.usage_limit}`);
        }
        console.log('');

        // Example 6: Batch processing
        console.log('🔄 Example 6: Batch Processing');
        const batchTasks = [
            { input: 'What is machine learning?', taskType: 'general' },
            { input: 'Summarize: The quick brown fox jumps over the lazy dog.', taskType: 'summary' },
            { input: 'Translate to Spanish: Good morning', taskType: 'translation' }
        ];

        const batchResults = await router.batchRoute(batchTasks);
        console.log('Batch results:');
        batchResults.forEach((result, index) => {
            console.log(`  ${index + 1}. ${result.response.substring(0, 50)}...`);
        });
        console.log('');

        // Example 7: Performance stats
        console.log('⚡ Example 7: Performance Stats');
        const performance = await router.getPerformanceStats();
        console.log('Cache size:', performance.cache_stats.size);
        console.log('Cache hit rate:', `${(performance.cache_stats.hitRate * 100).toFixed(1)}%`);
        console.log('Available models:', performance.model_stats.available_models.length);
        console.log('Available providers:', performance.model_stats.provider_stats.available_providers.join(', '));
        console.log('');

        console.log('🎉 All examples completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

// Run the example
if (require.main === module) {
    runExample();
}

module.exports = { runExample };