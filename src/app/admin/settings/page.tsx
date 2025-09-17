"use client";

import { Bell, CreditCard, Save, Shield, User } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        name: "John Developer",
        email: "john@example.com",
        company: "Acme Inc",
        timezone: "Europe/Madrid"
    });

    const [notifications, setNotifications] = useState({
        email: true,
        slack: false,
        discord: false
    });

    const [security, setSecurity] = useState({
        twoFactor: false,
        passwordReset: false
    });

    const handleSave = () => {
        // En una implementación real, esto enviaría los datos a una API
        console.log("Saving settings:", { profile, notifications, security });
        alert("Settings saved successfully!");
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Profile settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                    </div>
                </div>
                <div className="px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                Company
                            </label>
                            <input
                                type="text"
                                id="company"
                                value={profile.company}
                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                Timezone
                            </label>
                            <select
                                id="timezone"
                                value={profile.timezone}
                                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            >
                                <option value="Europe/Madrid">Europe/Madrid</option>
                                <option value="America/New_York">America/New York</option>
                                <option value="America/Los_Angeles">America/Los Angeles</option>
                                <option value="Asia/Tokyo">Asia/Tokyo</option>
                                <option value="Europe/London">Europe/London</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </div>
                </div>
                <div className="px-6 py-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                            <p className="text-sm text-gray-500">Receive usage alerts and billing updates via email</p>
                        </div>
                        <button
                            onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.email ? 'bg-emerald-600' : 'bg-gray-200'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.email ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Slack Integration</h3>
                            <p className="text-sm text-gray-500">Send notifications to your Slack workspace</p>
                        </div>
                        <button
                            onClick={() => setNotifications({ ...notifications, slack: !notifications.slack })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.slack ? 'bg-emerald-600' : 'bg-gray-200'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.slack ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Discord Integration</h3>
                            <p className="text-sm text-gray-500">Send notifications to your Discord server</p>
                        </div>
                        <button
                            onClick={() => setNotifications({ ...notifications, discord: !notifications.discord })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.discord ? 'bg-emerald-600' : 'bg-gray-200'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.discord ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Security settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    </div>
                </div>
                <div className="px-6 py-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <button
                            onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${security.twoFactor ? 'bg-emerald-600' : 'bg-gray-200'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Password Reset</h3>
                            <p className="text-sm text-gray-500">Require password reset every 90 days</p>
                        </div>
                        <button
                            onClick={() => setSecurity({ ...security, passwordReset: !security.passwordReset })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${security.passwordReset ? 'bg-emerald-600' : 'bg-gray-200'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${security.passwordReset ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Update Payment Method
                        </button>
                    </div>
                </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}