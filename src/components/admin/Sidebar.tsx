"use client";

import {
    BarChart3,
    Bell,
    CreditCard,
    HelpCircle,
    Key,
    LayoutDashboard,
    Settings,
    User,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "API Keys", href: "/admin/keys", icon: Key },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Billing", href: "/admin/billing", icon: CreditCard },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Help", href: "/admin/help", icon: HelpCircle },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex flex-col flex-grow border-r border-gray-200 bg-white">
                <div className="flex items-center justify-center h-16 px-4 bg-emerald-600">
                    <Link href="/admin" className="text-xl font-bold text-white">
                        AgentRouter
                    </Link>
                </div>
                <div className="flex-grow flex flex-col pt-5 pb-4 overflow-y-auto">
                    <nav className="mt-5 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                            ? "bg-emerald-100 text-emerald-900"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon
                                        className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? "text-emerald-700" : "text-gray-400 group-hover:text-gray-500"
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div>
                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                    John Developer
                                </p>
                                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                    View profile
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}