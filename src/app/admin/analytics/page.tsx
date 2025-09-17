"use client";

export default function AnalyticsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">
                Detailed insights into your API usage and costs
            </p>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Usage Statistics</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
                        <p className="text-2xl font-semibold text-gray-900">$158.75</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
                        <p className="text-2xl font-semibold text-gray-900">2,450</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Avg. Cost/Request</h3>
                        <p className="text-2xl font-semibold text-gray-900">$0.0648</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Active API Keys</h3>
                        <p className="text-2xl font-semibold text-gray-900">12</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Usage Trends</h2>
                <div className="mt-4 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Interactive charts would appear here</p>
                </div>
            </div>
        </div>
    );
}