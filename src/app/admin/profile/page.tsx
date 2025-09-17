"use client";

import { Building, Globe, Mail, User } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "John Developer",
        email: "john@example.com",
        company: "Acme Inc",
        timezone: "Europe/Madrid"
    });

    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        // Simular guardado
        setTimeout(() => {
            setSaving(false);
            alert("Profile updated successfully!");
        }, 1000);
    };

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Update your personal details
                    </p>
                </div>
                <div className="px-6 py-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                Company
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="company"
                                    value={profile.company}
                                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                Timezone
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="timezone"
                                    value={profile.timezone}
                                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
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

                    <div className="mt-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your account security settings
                    </p>
                </div>
                <div className="px-6 py-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="current-password" className="block text-sm text-gray-700">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        id="current-password"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="new-password" className="block text-sm text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="new-password"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}