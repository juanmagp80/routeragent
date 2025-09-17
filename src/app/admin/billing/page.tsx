"use client";

export default function BillingPage() {
    const plan = {
        name: "Pro Plan",
        price: "$99",
        period: "per month",
        features: [
            "Up to 5,000 API requests/month",
            "Access to all AI models",
            "Priority support",
            "Advanced analytics",
            "Webhook integrations"
        ],
        next_billing: "October 15, 2025",
        payment_method: "Visa ending in 4242"
    };

    const invoices = [
        {
            id: "INV-001",
            date: "September 15, 2025",
            amount: "$99.00",
            status: "Paid",
            pdf: "#"
        },
        {
            id: "INV-002",
            date: "August 15, 2025",
            amount: "$99.00",
            status: "Paid",
            pdf: "#"
        },
        {
            id: "INV-003",
            date: "July 15, 2025",
            amount: "$99.00",
            status: "Paid",
            pdf: "#"
        }
    ];

    const usage = {
        requests: 2450,
        limit: 5000,
        percentage: 49
    };

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your subscription and payment methods
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current plan */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {plan.name}
                        </p>
                    </div>
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{plan.price}</p>
                                <p className="text-sm text-gray-500">{plan.period}</p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                Active
                            </span>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900">Plan Features</h3>
                            <ul className="mt-2 space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="ml-2 text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Next Billing Date</p>
                                    <p className="text-sm text-gray-500">{plan.next_billing}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Payment Method</p>
                                    <p className="text-sm text-gray-500">{plan.payment_method}</p>
                                </div>
                                <button className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage meter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Usage Meter</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Track your API request usage
                        </p>
                    </div>
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{usage.requests.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">of {usage.limit.toLocaleString()} requests</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {usage.percentage}%
                            </span>
                        </div>

                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-emerald-600 h-2.5 rounded-full"
                                    style={{ width: `${usage.percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                Upgrade Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice history */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Download past invoices
                    </p>
                </div>
                <div className="divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                        <div key={invoice.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{invoice.id}</p>
                                    <p className="text-sm text-gray-500">{invoice.date}</p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-sm font-medium text-gray-900">{invoice.amount}</p>
                                    <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === "Paid"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {invoice.status}
                                    </span>
                                    <button className="ml-4 text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}