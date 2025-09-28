"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Autenticación simple usando localStorage
        const checkAuth = () => {
            if (typeof window !== 'undefined') {
                // Por ahora, solo verificar si hay algún token o usuario en localStorage
                const token = localStorage.getItem('token') || 
                             localStorage.getItem('agentrouter_user') ||
                             localStorage.getItem('supabase.auth.token');
                
                // BYPASS TEMPORAL: permitir acceso al dashboard para debugging
                // TODO: Remover esto una vez que la autenticación esté funcionando
                const isDevelopment = process.env.NODE_ENV === 'development';
                
                if (token || isDevelopment) {
                    setIsAuthenticated(true);
                    // Si no hay token pero estamos en desarrollo, crear uno temporal
                    if (!token && isDevelopment) {
                        localStorage.setItem('temp_admin_token', 'development_access');
                    }
                } else {
                    setIsAuthenticated(false);
                    router.push("/login");
                }
            }
        };

        checkAuth();
    }, [router]);

    // Mientras se verifica la autenticación
    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Si no está autenticado, mostrar loading (se redirigirá a login)
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-600">Redirecting to login...</div>
            </div>
        );
    }

    return <>{children}</>;
}