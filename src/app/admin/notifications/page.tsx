"use client";

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            title: "API Key Created",
            description: "New API key 'Production Key' has been created successfully",
            time: "2 hours ago",
            type: "success",
            read: false
        },
        {
            id: 2,
            title: "Usage Limit Warning",
            description: "You've reached 80% of your monthly request limit",
            time: "1 day ago",
            type: "warning",
            read: true
        },
        {
            id: 3,
            title: "New Feature Available",
            description: "Webhook integration is now available for all plans",
            time: "2 days ago",
            type: "info",
            read: true
        },
        {
            id: 4,
            title: "Payment Successful",
            description: "Your monthly subscription payment of $99 has been processed",
            time: "1 week ago",
            type: "success",
            read: true
        },
        {
            id: 5,
            title: "Security Alert",
            description: "New login detected from IP address 192.168.1.100",
            time: "1 week ago",
            type: "alert",
            read: true
        }
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Stay updated with important events and alerts
                    </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                    Mark all as read
                </button>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {notifications.length} notifications
                    </p>
                </div>
                <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`px-6 py-4 ${!notification.read ? "bg-emerald-50" : ""}`}
                        >
                            <div className="flex items-start">
                                <div className={`flex-shrink-0 mt-1 ${notification.type === "success" ? "text-emerald-500" :
                                        notification.type === "warning" ? "text-yellow-500" :
                                            notification.type === "alert" ? "text-red-500" : "text-blue-500"
                                    }`}>
                                    {notification.type === "success" && (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {notification.type === "warning" && (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                    {notification.type === "alert" && (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                    {notification.type === "info" && (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {notification.time}
                                        </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {notification.description}
                                    </p>
                                    {!notification.read && (
                                        <div className="mt-2">
                                            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
                                                Mark as read
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notification preferences */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Customize which notifications you receive
                    </p>
                </div>
                <div className="px-6 py-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                                <p className="text-sm text-gray-500">Receive important updates via email</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Slack Integration</h3>
                                <p className="text-sm text-gray-500">Send notifications to Slack</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Usage Alerts</h3>
                                <p className="text-sm text-gray-500">Notify when approaching limits</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Security Alerts</h3>
                                <p className="text-sm text-gray-500">Important security notifications</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}