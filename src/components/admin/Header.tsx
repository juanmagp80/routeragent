"use client";

import { Bell, Search, User } from "lucide-react";
import { useState } from "react";

export default function AdminHeader() {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Search */}
                    <div className="flex items-center">
                        {searchOpen ? (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    placeholder="Search..."
                                    onBlur={() => setSearchOpen(false)}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                            >
                                <Search className="h-6 w-6" />
                                <span className="sr-only">Open search</span>
                            </button>
                        )}
                    </div>

                    {/* Right side - Notifications and user menu */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            <span className="sr-only">View notifications</span>
                            <div className="relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400"></span>
                            </div>
                        </button>

                        {/* User menu */}
                        <div className="relative ml-3">
                            <div>
                                <button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <span className="ml-2 hidden md:block text-sm font-medium text-gray-700">John Developer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}