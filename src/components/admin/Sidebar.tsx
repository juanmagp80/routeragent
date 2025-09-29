"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
    BarChart3,
    Bell,
    CreditCard,
    HelpCircle,
    Key,
    LayoutDashboard,
    LogOut,
    Play,
    Settings,
    User,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
    { name: "Panel Principal", href: "/admin", icon: LayoutDashboard },
    { name: "Claves API", href: "/admin/keys", icon: Key },
    { name: "Prueba API", href: "/admin/test-api", icon: Play },
    { name: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
    { name: "Usuarios", href: "/admin/users", icon: Users },
    { name: "Facturación", href: "/admin/billing", icon: CreditCard },
    { name: "Notificaciones", href: "/admin/notifications", icon: Bell },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
    { name: "Ayuda", href: "/admin/help", icon: HelpCircle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();

    const handleLogout = () => {
        // Limpiar todas las sesiones y tokens
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();

            // También limpiar cookies de Supabase si existen
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        }

        // Redirigir al login
        router.push('/login');
    };

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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div>
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                        {user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                        Ver perfil
                                    </p>
                                </div>
                            </div>

                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}