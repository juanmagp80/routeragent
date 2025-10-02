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
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
            <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700">
                <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
                    <Link href="/admin" className="relative z-10 text-2xl font-black text-white tracking-wide hover:scale-110 transition-all duration-300 hover:drop-shadow-lg">
                        <span className="font-mono bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                            RouterAI
                        </span>
                    </Link>
                </div>
                <div className="flex-grow flex flex-col pt-8 pb-4 overflow-y-auto">
                    <nav className="flex-1 px-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 transform relative overflow-hidden ${isActive
                                        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-xl scale-105 border border-emerald-400/50"
                                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-102 hover:shadow-lg backdrop-blur-sm"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                                    )}
                                    <Icon
                                        className={`mr-4 flex-shrink-0 h-6 w-6 transition-all duration-200 relative z-10 ${isActive
                                            ? "text-white drop-shadow-lg"
                                            : "text-slate-400 group-hover:text-emerald-400 group-hover:scale-110"
                                            }`}
                                    />
                                    <span className="font-bold tracking-wide relative z-10 text-base">{item.name}</span>
                                    {isActive && (
                                        <div className="ml-auto relative z-10">
                                            <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-slate-700/50 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/50 hover:bg-slate-700/50 transition-all duration-300 hover:shadow-xl">
                            <div className="flex items-center">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center shadow-2xl ring-2 ring-white/20">
                                        <User className="h-7 w-7 text-white drop-shadow-lg" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors tracking-wide">
                                        {user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                                        RouterAI Pro
                                    </p>
                                </div>
                            </div>

                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg backdrop-blur-sm border border-transparent hover:border-red-500/30"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}