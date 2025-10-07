"use client";

import { useEffect, useState } from "react";

interface SmartLoadingProps {
    isLoading: boolean;
    fallbackMessage?: string;
    maxLoadingTime?: number; // En milisegundos
    onTimeout?: () => void;
}

export function SmartLoading({ 
    isLoading, 
    fallbackMessage = "La carga está tomando más tiempo del esperado. Reintentando...",
    maxLoadingTime = 10000, // 10 segundos por defecto
    onTimeout
}: SmartLoadingProps) {
    const [showFallback, setShowFallback] = useState(false);
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (!isLoading) {
            setShowFallback(false);
            return;
        }

        // Timeout para mostrar mensaje de fallback
        const fallbackTimer = setTimeout(() => {
            setShowFallback(true);
            if (onTimeout) {
                onTimeout();
            }
        }, maxLoadingTime);

        // Animación de dots
        const dotsTimer = setInterval(() => {
            setDots(prev => prev.length >= 3 ? "" : prev + ".");
        }, 500);

        return () => {
            clearTimeout(fallbackTimer);
            clearInterval(dotsTimer);
            setDots("");
        };
    }, [isLoading, maxLoadingTime, onTimeout]);

    if (!isLoading) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            
            <div className="text-center space-y-2">
                <div className="text-sm text-gray-600">
                    Cargando{dots}
                </div>
                
                {showFallback && (
                    <div className="max-w-md text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        ⚠️ {fallbackMessage}
                    </div>
                )}
            </div>
        </div>
    );
}