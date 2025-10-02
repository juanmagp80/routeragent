# RouterAI SDK for JavaScript/Node.js

[![npm version](https://img.shields.io/npm/v/agentrouter-sdk.svg)](https://www.npmjs.com/package/agentrouter-sdk)
[![License](https://img.shields.io/npm/l/agentrouter-sdk.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/agentrouter-sdk.svg)](https://www.npmjs.com/package/agentrouter-sdk)

Official JavaScript/Node.js SDK for **RouterAI** - Intelligent AI model routing that reduces your AI costs by 70-95% without changing your code.

## 🚀 Quick Start

### Installation

```bash
npm install agentrouter-sdk
```

### Basic Usage

```javascript
import AgentRouter from 'agentrouter-sdk';

// Initialize with your API key
const router = new AgentRouter('ar_your_api_key_here');

// Route any AI task to the optimal model
const result = await router.route({
  input: 'Explain quantum computing in simple terms',
  taskType: 'general'
});

console.log(result.response);
// Output: Automatically optimized response from the best AI model
```

## 🧠 How It Works

RouterAI uses **advanced intelligent routing** to select the optimal AI model for each task:

1. **Analyzes** your task (summary, translation, analysis, etc.)
2. **Evaluates** available models based on quality, speed, and cost
3. **Routes** to the optimal model automatically
4. **Returns** the response with 70-95% cost savings

## 📦 Features

- **🎯 Intelligent Routing**: Automatic model selection based on task type
- **💰 Cost Optimization**: Reduce AI costs by 70-95%
- **⚡ Zero Code Changes**: Replace existing OpenAI/Anthropic calls directly
- **🛡️ Enterprise Ready**: Built-in retries, timeouts, and error handling
- **📊 Real-time Metrics**: Monitor usage and savings
- **🔒 Secure**: Bearer token authentication
- **🌐 Universal**: Works in Node.js and browsers

## 🛠️ Installation

### npm

```bash
npm install agentrouter-sdk
```

### yarn

```bash
yarn add agentrouter-sdk
```

## 💡 Usage Examples

### Simple Task Routing

```javascript
import AgentRouter from 'agentrouter-sdk';

const router = new AgentRouter('ar_your_api_key_here');

// Simple general question
const response1 = await router.route({
  input: 'What is the capital of France?',
 taskType: 'general'
});

// Document summary
const response2 = await router.route({
  input: 'Your long document text here...',
  taskType: 'summary'
});

// Translation
const response3 = await router.route({
  input: 'Hello, how are you?',
  taskType: 'translation'
});
```

### Advanced Configuration

```javascript
const router = new AgentRouter('ar_your_api_key_here', {
  baseUrl: 'https://api.agentrouter.com', // Custom endpoint
  timeout: 30000, // 30 second timeout
  retries: 3 // 3 retry attempts
});

// Model preferences
const result = await router.route({
  input: 'Complex analysis task',
  taskType: 'analysis',
  modelPreferences: {
    preferredModels: ['gpt-4o', 'claude-3'],
    avoidModels: ['gpt-3.5-turbo'],
    qualityTarget: 'high',
    costTarget: 'medium'
  }
});
```

### Batch Processing

```javascript
const tasks = [
  { input: 'Task 1', taskType: 'general' },
  { input: 'Task 2', taskType: 'summary' },
  { input: 'Task 3', taskType: 'translation' }
];

const results = await router.batchRoute(tasks);
```

### Monitoring and Metrics

```javascript
// Get usage metrics
const metrics = await router.getMetrics();
console.log(`Total cost saved: $${metrics.summary.total_cost}`);

// Validate API key
const validation = await router.validateKey();
console.log(`API key valid: ${validation.valid}`);

// Get performance stats
const performance = await router.getPerformanceStats();
console.log(`Cache hit rate: ${(performance.cache_stats.hitRate * 100).toFixed(1)}%`);
```

## 📚 API Reference

### `new AgentRouter(apiKey, options)`

Create a new AgentRouter instance.

**Parameters:**
- `apiKey` (string): Your AgentRouter API key
- `options` (object, optional):
  - `baseUrl` (string): Custom API endpoint
  - `timeout` (number): Request timeout in ms
  - `retries` (number): Number of retry attempts

### `route(params)`

Route a task to the optimal AI model.

**Parameters:**
- `params` (object):
  - `input` (string): The input text/prompt
  - `taskType` (string): Task type ('summary', 'translation', 'analysis', 'general', 'coding')
  - `modelPreferences` (object, optional): Model preferences

**Returns:** Promise<RouteResponse>

### `getMetrics()`

Get usage metrics for your API key.

**Returns:** Promise<MetricsResponse>

### `getApiKeyStats(keyId)`

Get detailed statistics for an API key.

**Parameters:**
- `keyId` (string): API key ID

**Returns:** Promise<ApiKeyStats>

### `validateKey()`

Validate your API key.

**Returns:** Promise<ValidationResponse>

### `getPerformanceStats()`

Get system performance and cache statistics.

**Returns:** Promise<PerformanceStats>

### `clearCache(taskType)`

Clear cache entries.

**Parameters:**
- `taskType` (string, optional): Specific task type to clear

**Returns:** Promise<ClearCacheResponse>

### `batchRoute(tasks)`

Process multiple tasks in batch.

**Parameters:**
- `tasks` (Array<RouteParams>): Array of task objects

**Returns:** Promise<RouteResponse[]>

### `streamRoute(params, onChunk)`

Stream processing for large tasks (future feature).

**Parameters:**
- `params` (RouteParams): Task parameters
- `onChunk` (Function, optional): Callback for each chunk

**Returns:** Promise<RouteResponse>

## 🎯 Use Cases

### 1. Chatbots and Virtual Assistants
```javascript
// Replace expensive GPT-4 calls with intelligent routing
const response = await router.route({
  input: userMessage,
  taskType: 'general'
});
```

### 2. Content Generation and Summarization
```javascript
// Automatically choose optimal model for content tasks
const summary = await router.route({
  input: longDocument,
  taskType: 'summary'
});
```

### 3. Translation Services
```javascript
// Route translations to best model for language pair
const translation = await router.route({
  input: textToTranslate,
  taskType: 'translation'
});
```

### 4. Data Analysis and Insights
```javascript
// Use high-quality models for complex analysis
const analysis = await router.route({
  input: dataReport,
  taskType: 'analysis'
});
```

## 🔧 Error Handling

```javascript
try {
  const result = await router.route({
    input: 'Your query here',
    taskType: 'general'
  });
} catch (error) {
  if (error.message.includes('API key')) {
    console.log('Invalid API key');
  } else if (error.message.includes('timeout')) {
    console.log('Request timeout');
  } else {
    console.log('Other error:', error.message);
  }
}
```

## 📈 Cost Savings

Typical savings by task type:

| Task Type | Average Savings | Example |
|-----------|----------------|---------|
| General Q&A | 85% | $0.03 → $0.045 |
| Document Summary | 90% | $0.15 → $0.015 |
| Translation | 88% | $0.08 → $0.01 |
| Analysis | 92% | $0.25 → $0.02 |

## 🛡️ Security

- All requests use HTTPS
- API keys use Bearer token authentication
- Keys should be stored securely (environment variables)
- Never commit API keys to source code

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

- Documentation: [https://agentrouter.com/docs](https://agentrouter.com/docs)
- Issues: [GitHub Issues](https://github.com/agentrouter/agentrouter-sdk-js/issues)
- Email: support@agentrouter.com

## 🚀 Getting Started

1. Sign up at [https://agentrouter.com](https://agentrouter.com)
2. Get your API key from the dashboard
3. Install the SDK: `npm install agentrouter-sdk`
4. Start routing tasks intelligently!

```javascript
// One line to start saving money
const router = new AgentRouter('ar_your_api_key_here');
```

AgentRouter automatically optimizes every AI call to save you 70-95% while maintaining quality.