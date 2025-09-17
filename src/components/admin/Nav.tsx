"use client";

import {
    BarChart3,
    Bell,
    CreditCard,
    Key,
    LayoutDashboard,
    Settings,
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
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? "bg-emerald-500 text-white"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                    >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}