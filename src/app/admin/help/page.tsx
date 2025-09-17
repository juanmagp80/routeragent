"use client";

export default function HelpPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
            <p className="mt-1 text-sm text-gray-600">
                Find answers to common questions and get support
            </p>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
                <div className="mt-4 space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900">
                            How do I create a new API key?
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Navigate to the API Keys section in your dashboard, click 'Create API Key', give it a name, select your plan, and click 'Create'. Your new API key will be generated and displayed.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900">
                            What AI models are supported?
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            AgentRouter supports all major AI models including GPT-4, GPT-4o, GPT-4o Mini, Claude-3, Claude-3.5 Sonnet, Llama-3, Mistral-7B, and more. The router automatically selects the optimal model for each task.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900">
                            How does the cost optimization work?
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Our intelligent routing algorithm analyzes each task and selects the most cost-effective model that meets quality requirements. On average, users save 70-95% compared to using premium models exclusively.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Contact Support</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Email Support</p>
                            <p className="text-sm text-gray-500">support@agentrouter.com</p>
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Live Chat</p>
                            <p className="text-sm text-gray-500">Available 24/7</p>
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Phone Support</p>
                            <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}