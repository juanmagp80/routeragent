/**
 * Test suite for AgentRouter SDK
 * Run with: node test.js
 */

const AgentRouter = require('./index.js');

// Test API key (using the one we created earlier)
const TEST_API_KEY = 'ar_6f7ccf7894c970ee9012cd50d8096a3edf2fed8122f39b53d6c47fef9a69239a';

async function runTests() {
    console.log('🧪 Running AgentRouter SDK Tests...\n');

    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Constructor
    totalTests++;
    try {
        const router = new AgentRouter(TEST_API_KEY);
        console.log('✅ Test 1 PASSED: Constructor works');
        passedTests++;
    } catch (error) {
        console.log('❌ Test 1 FAILED:', error.message);
    }

    // Test 2: Invalid API key
    totalTests++;
    try {
        const router = new AgentRouter('invalid_key');
        console.log('❌ Test 2 FAILED: Should have thrown error for invalid key');
    } catch (error) {
        if (error.message.includes('Invalid API key format')) {
            console.log('✅ Test 2 PASSED: Correctly rejects invalid API key format');
            passedTests++;
        } else {
            console.log('❌ Test 2 FAILED:', error.message);
        }
    }

    // Test 3: Missing API key
    totalTests++;
    try {
        const router = new AgentRouter();
        console.log('❌ Test 3 FAILED: Should have thrown error for missing key');
    } catch (error) {
        if (error.message.includes('API key is required')) {
            console.log('✅ Test 3 PASSED: Correctly rejects missing API key');
            passedTests++;
        } else {
            console.log('❌ Test 3 FAILED:', error.message);
        }
    }

    // Test 4: Simple route
    totalTests++;
    try {
        const router = new AgentRouter(TEST_API_KEY);
        const result = await router.route({
            input: 'What is 2+2?',
            taskType: 'general'
        });

        if (result.success && result.response) {
            console.log('✅ Test 4 PASSED: Simple route works');
            passedTests++;
        } else {
            console.log('❌ Test 4 FAILED: Route did not return success');
        }
    } catch (error) {
        console.log('❌ Test 4 FAILED:', error.message);
    }

    // Test 5: Route without input
    totalTests++;
    try {
        const router = new AgentRouter(TEST_API_KEY);
        await router.route({
            taskType: 'general'
        });
        console.log('❌ Test 5 FAILED: Should have thrown error for missing input');
    } catch (error) {
        if (error.message.includes('Input is required')) {
            console.log('✅ Test 5 PASSED: Correctly rejects missing input');
            passedTests++;
        } else {
            console.log('❌ Test 5 FAILED:', error.message);
        }
    }

    // Test 6: Get metrics
    totalTests++;
    try {
        const router = new AgentRouter(TEST_API_KEY);
        const metrics = await router.getMetrics();

        if (metrics.success && metrics.summary) {
            console.log('✅ Test 6 PASSED: Get metrics works');
            passedTests++;
        } else {
            console.log('❌ Test 6 FAILED: Metrics did not return success');
        }
    } catch (error) {
        console.log('❌ Test 6 FAILED:', error.message);
    }

    // Test 7: Validate key
    totalTests++;
    try {
        const router = new AgentRouter(TEST_API_KEY);
        const validation = await router.validateKey();

        if (validation.success && validation.valid) {
            console.log('✅ Test 7 PASSED: Validate key works');
            passedTests++;
        } else {
            console.log('❌ Test 7 FAILED: Key validation failed');
        }
    } catch (error) {
        console.log('❌ Test 7 FAILED:', error.message);
    }

    // Test 8: Batch route
    totalTests++;
    try {
        const router = new AgentRouter(TEST_API_KEY);
        const tasks = [
            { input: 'Hello', taskType: 'general' },
            { input: 'World', taskType: 'general' }
        ];

        const results = await router.batchRoute(tasks);

        if (Array.isArray(results) && results.length === 2) {
            console.log('✅ Test 8 PASSED: Batch route works');
            passedTests++;
        } else {
            console.log('❌ Test 8 FAILED: Batch route did not return correct results');
        }
    } catch (error) {
        console.log('❌ Test 8 FAILED:', error.message);
    }

    // Test 9: Performance stats
    totalTests++;
    try {
        const router = new AgentRouter(TEST_API_KEY);
        const stats = await router.getPerformanceStats();

        if (stats.success && stats.cache_stats) {
            console.log('✅ Test 9 PASSED: Performance stats works');
            passedTests++;
        } else {
            console.log('❌ Test 9 FAILED: Performance stats failed');
        }
    } catch (error) {
        console.log('❌ Test 9 FAILED:', error.message);
    }

    // Test 10: SDK version
    totalTests++;
    try {
        const version = AgentRouter.getVersion();
        if (typeof version === 'string' && version.length > 0) {
            console.log('✅ Test 10 PASSED: SDK version works');
            passedTests++;
        } else {
            console.log('❌ Test 10 FAILED: Invalid version returned');
        }
    } catch (error) {
        console.log('❌ Test 10 FAILED:', error.message);
    }

    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed');
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    runTests();
}

module.exports = { runTests };