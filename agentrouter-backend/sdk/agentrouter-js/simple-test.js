/**
 * Simple test for AgentRouter SDK
 * Run with: node simple-test.js
 */

// Try different import methods
try {
    // Method 1: CommonJS
    const AgentRouter = require('./index.js');
    console.log('✅ CommonJS import works');
    console.log('AgentRouter type:', typeof AgentRouter);

    // Check if it's a constructor
    if (typeof AgentRouter === 'function') {
        console.log('✅ AgentRouter is a function');
    } else {
        console.log('❌ AgentRouter is not a function');
        console.log('AgentRouter:', AgentRouter);
    }

    // Check if it has static methods
    if (AgentRouter.getVersion) {
        console.log('✅ getVersion method exists');
        console.log('Version:', AgentRouter.getVersion());
    } else {
        console.log('❌ getVersion method missing');
    }

} catch (error) {
    console.log('❌ CommonJS import failed:', error.message);
}

// Try ES6 import (if supported)
try {
    // This might not work in Node.js without proper configuration
    console.log('ℹ️ ES6 import test skipped (Node.js configuration required)');
} catch (error) {
    console.log('ℹ️  ES6 import test skipped:', error.message);
}