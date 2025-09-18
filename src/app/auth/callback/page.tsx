"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../config/database';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        console.log('Auth callback params:', { accessToken, refreshToken, type });

        if (type === 'signup' && accessToken) {
          // Establecer la sesión con los tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken!
          });

          if (error) {
            console.error('Error setting session:', error);
            setStatus('error');
            setMessage('Error verificando tu email. Intenta de nuevo.');
            return;
          }

          console.log('Email verificado exitosamente:', data);
          setStatus('success');
          setMessage('¡Email verificado exitosamente! Redirigiendo...');
          
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            router.push('/user');
          }, 2000);

        } else {
          setStatus('error');
          setMessage('Link de verificación inválido o expirado.');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Error procesando la verificación.');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Verificando Email</h2>
              <p className="text-gray-400">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Email Verificado!</h2>
              <p className="text-gray-400">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Error de Verificación</h2>
              <p className="text-gray-400 mb-4">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Volver al Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
