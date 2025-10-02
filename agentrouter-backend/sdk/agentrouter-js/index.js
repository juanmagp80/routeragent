/**
 * RouterAI SDK for JavaScript/Node.js
 * 
 * Simple SDK to integrate RouterAI intelligent AI routing
 * into your applications with minimal code changes.
 */

class AgentRouter {
    constructor(apiKey, options = {}) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        if (!apiKey.startsWith('ar_')) {
            throw new Error('Invalid API key format. Must start with "ar_"');
        }

        this.apiKey = apiKey;
        this.baseUrl = options.baseUrl || 'https://api.agentrouter.com';
        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 3;
    }

    /**
     * Route a task to the optimal AI model
     * @param {Object} params - Task parameters
     * @param {string} params.input - The input text/prompt
     * @param {string} [params.taskType] - Type of task: summary, translation, analysis, general, coding
     * @param {Object} [params.modelPreferences] - Model preferences
     * @param {string[]} [params.modelPreferences.preferredModels] - Preferred models
     * @param {string[]} [params.modelPreferences.avoidModels] - Models to avoid
     * @param {string} [params.modelPreferences.qualityTarget] - Quality target: high, medium, low
     * @param {string} [params.modelPreferences.costTarget] - Cost target: low, medium, high
     * @returns {Promise<Object>} Response from optimal AI model
     */
    async route(params) {
        const { input, taskType = 'general', modelPreferences, ...options } = params;

        if (!input) {
            throw new Error('Input is required');
        }

        const requestBody = {
            input,
            task_type: taskType,
            ...(modelPreferences && { model_preferences: modelPreferences }),
            ...options
        };

        return this._makeRequest('/v1/route', 'POST', requestBody);
    }

    /**
     * Get usage metrics for your API key
     * @returns {Promise<Object>} Usage metrics and statistics
     */
    async getMetrics() {
        return this._makeRequest('/v1/metrics', 'GET');
    }

    /**
     * Get API key statistics
     * @param {string} keyId - API key ID
     * @returns {Promise<Object>} API key usage statistics
     */
    async getApiKeyStats(keyId) {
        return this._makeRequest(`/v1/api-keys/${keyId}/stats`, 'GET');
    }

    /**
     * Validate API key
     * @returns {Promise<Object>} API key validation result
     */
    async validateKey() {
        return this._makeRequest('/v1/api-keys/validate', 'POST', {
            api_key: this.apiKey
        });
    }

    /**
     * Get performance statistics
     * @returns {Promise<Object>} System performance and cache stats
     */
    async getPerformanceStats() {
        return this._makeRequest('/v1/performance', 'GET');
    }

    /**
     * Clear cache (admin function)
     * @param {string} [taskType] - Specific task type to clear, or all if not specified
     * @returns {Promise<Object>} Cache clear result
     */
    async clearCache(taskType = null) {
        const body = taskType ? { task_type: taskType } : {};
        return this._makeRequest('/v1/cache/clear', 'POST', body);
    }

    /**
     * Batch process multiple tasks
     * @param {Array<Object>} tasks - Array of task objects
     * @returns {Promise<Array>} Array of responses
     */
    async batchRoute(tasks) {
        if (!Array.isArray(tasks)) {
            throw new Error('Tasks must be an array');
        }

        const promises = tasks.map(task => this.route(task));
        return Promise.all(promises);
    }

    /**
     * Stream processing for large tasks (placeholder for future implementation)
     * @param {Object} params - Task parameters
     * @param {Function} onChunk - Callback for each chunk
     * @returns {Promise<Object>} Final response
     */
    async streamRoute(params, onChunk) {
        // For now, just use regular route
        // In future, implement streaming for large responses
        const result = await this.route(params);

        if (onChunk) {
            onChunk(result);
        }

        return result;
    }

    /**
     * Internal method to make HTTP requests
     * @private
     */
    async _makeRequest(endpoint, method, body = null, attempt = 1) {
        const url = `${this.baseUrl}${endpoint}`;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'User-Agent': 'AgentRouter-SDK/1.0.0'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error ${response.status}: ${errorData.error || response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }

            // Retry logic for network errors
            if (attempt < this.retries && this._isRetryableError(error)) {
                console.warn(`Request failed, retrying (${attempt}/${this.retries}):`, error.message);
                await this._delay(1000 * attempt); // Exponential backoff
                return this._makeRequest(endpoint, method, body, attempt + 1);
            }

            throw error;
        }
    }

    /**
     * Check if error is retryable
     * @private
     */
    _isRetryableError(error) {
        return error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('timeout');
    }

    /**
     * Delay utility for retries
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get SDK version
     * @returns {string} SDK version
     */
    static getVersion() {
        return '1.0.0';
    }

    /**
     * Create a new AgentRouter instance
     * @param {string} apiKey - Your AgentRouter API key
     * @param {Object} [options] - Configuration options
     * @returns {AgentRouter} New AgentRouter instance
     */
    static create(apiKey, options) {
        return new AgentRouter(apiKey, options);
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentRouter;
    module.exports.default = AgentRouter;
}

if (typeof window !== 'undefined') {
    window.AgentRouter = AgentRouter;
}

export default AgentRouter;