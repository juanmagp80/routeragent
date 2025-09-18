// Simple test page to verify routing works
"use client";

import { useEffect } from 'react';
import { clearPendingRedirect } from '../../utils/redirect';

console.log('🧪 Test page loaded');

export default function TestPage() {
    console.log('🧪 Test component rendered');
    
    useEffect(() => {
        // Limpiar redirección pendiente cuando llegamos aquí
        clearPendingRedirect();
        console.log('✅ Test page mounted successfully');
    }, []);
    
    return (
        <div className="min-h-screen bg-red-500 flex items-center justify-center">
            <div className="text-white text-center">
                <h1 className="text-4xl font-bold">TEST PAGE</h1>
                <p className="mt-2">Si puedes ver esto, las rutas funcionan correctamente</p>
                <p className="mt-1 text-sm">🎉 ¡La redirección post-login está funcionando!</p>
                <button 
                    onClick={() => window.location.href = '/login'}
                    className="bg-white text-red-500 px-4 py-2 rounded mt-4 hover:bg-gray-100"
                >
                    Volver al login
                </button>
                <br />
                <button 
                    onClick={() => window.location.href = '/user'}
                    className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600"
                >
                    Ir al Dashboard Real
                </button>
            </div>
        </div>
    );
}
