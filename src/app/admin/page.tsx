export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
                Welcome back! Here's what's happening with your AgentRouter account.
            </p>

            <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Account Summary</h2>
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
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">GPT-4o</p>
                                <p className="text-sm text-gray-500">Document summarization</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-900">$0.0234</p>
                                <p className="text-sm text-gray-500">2 min ago</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Claude-3</p>
                                <p className="text-sm text-gray-500">Code review</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-900">$0.0156</p>
                                <p className="text-sm text-gray-500">5 min ago</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">GPT-4o Mini</p>
                                <p className="text-sm text-gray-500">Translation</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-900">$0.0089</p>
                                <p className="text-sm text-gray-500">8 min ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}