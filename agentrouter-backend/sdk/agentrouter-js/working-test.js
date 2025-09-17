/**
 * Working test for AgentRouter SDK
 * Run with: node working-test.js
 */

// Import the module
const AgentRouterModule = require('./index.js');

// Get the actual class (it's in the default property)
const AgentRouter = AgentRouterModule.default || AgentRouterModule;

console.log('🧪 Testing AgentRouter SDK...');
console.log('AgentRouter type:', typeof AgentRouter);

// Check if it's a constructor
if (typeof AgentRouter === 'function') {
    console.log('✅ AgentRouter is a constructor function');

    // Test static methods
    if (typeof AgentRouter.getVersion === 'function') {
        console.log('✅ getVersion method exists');
        console.log('Version:', AgentRouter.getVersion());
    } else {
        console.log('❌ getVersion method missing');
    }

    if (typeof AgentRouter.create === 'function') {
        console.log('✅ create method exists');
    } else {
        console.log('❌ create method missing');
    }

    // Test creating an instance
    try {
        const router = new AgentRouter('ar_test_key_123456789');
        console.log('✅ Successfully created AgentRouter instance');
        console.log('Router type:', typeof router);

        // Check instance methods
        const methods = [
            'route', 'getMetrics', 'getApiKeyStats', 'validateKey',
            'getPerformanceStats', 'clearCache', 'batchRoute', 'streamRoute'
        ];

        methods.forEach(method => {
            if (typeof router[method] === 'function') {
                console.log(`✅ Method ${method} exists`);
            } else {
                console.log(`❌ Method ${method} missing`);
            }
        });

    } catch (error) {
        console.log('❌ Failed to create AgentRouter instance:', error.message);
    }

} else {
    console.log('❌ AgentRouter is not a constructor function');
    console.log('AgentRouter:', AgentRouter);
}

console.log('🎉 Test completed');