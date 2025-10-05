"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../config/database';
import { User } from '@supabase/supabase-js';

// Función para sincronizar usuarios OAuth con nuestra base de datos
async function syncOAuthUserWithDatabase(user: User) {
  try {
    console.log('🔍 === INICIO SINCRONIZACIÓN OAUTH ===');
    console.log('🔍 Usuario completo:', JSON.stringify(user, null, 2));
    console.log('🔍 User metadata:', JSON.stringify(user.user_metadata, null, 2));
    console.log('🔍 User identities:', JSON.stringify(user.identities, null, 2));
    console.log('🔍 Email directo:', user.email);
    console.log('🔍 ID de usuario:', user.id);
    
    // Extraer el nombre del usuario de diferentes fuentes posibles
    let userName = 'Usuario';
    if (user.user_metadata?.full_name) {
      userName = user.user_metadata.full_name;
    } else if (user.user_metadata?.name) {
      userName = user.user_metadata.name;
    } else if (user.identities && user.identities.length > 0) {
      const identity = user.identities[0];
      if (identity.identity_data?.full_name) {
        userName = identity.identity_data.full_name;
      } else if (identity.identity_data?.name) {
        userName = identity.identity_data.name;
      }
    } else if (user.email) {
      userName = user.email.split('@')[0];
    }

    console.log('Nombre extraído:', userName);
    
    // Verificar si el usuario ya existe en nuestra tabla
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error verificando usuario existente:', checkError);
      return;
    }

    // Usar upsert para manejar tanto inserción como actualización
    console.log(existingUser ? 'Usuario existe, actualizando...' : 'Usuario nuevo, creando...');
    
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        name: userName,
        company: existingUser?.company || '',
        role: existingUser?.role || 'user',
        plan: existingUser?.plan || 'free',
        updated_at: new Date().toISOString(),
        // Solo establecer created_at si es un usuario nuevo
        ...(existingUser ? {} : { created_at: new Date().toISOString() })
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error('❌ Error en upsert del usuario:', upsertError);
    } else {
      console.log('✅ Usuario sincronizado exitosamente en base de datos');
      console.log('✅ Datos del usuario:', {
        id: user.id,
        email: user.email,
        name: userName,
        isExisting: !!existingUser
      });
    }
    console.log('🔍 === FIN SINCRONIZACIÓN OAUTH ===');
  } catch (error) {
    console.error('❌ Error sincronizando usuario OAuth:', error);
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar si hay una sesión activa (para OAuth callbacks)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('Sesión OAuth establecida:', sessionData.session);
          
          // Sincronizar usuario con nuestra tabla personalizada
          await syncOAuthUserWithDatabase(sessionData.session.user);
          
          // Crear y guardar datos del usuario en localStorage para que AuthContext los cargue
          const userData = {
            id: sessionData.session.user.id,
            name: sessionData.session.user.user_metadata?.name || sessionData.session.user.user_metadata?.full_name || 'Usuario',
            email: sessionData.session.user.email || '',
            company: '',
            plan: 'free',
            api_key_limit: 1000,
            is_active: true,
            email_verified: true,
            created_at: sessionData.session.user.created_at || new Date().toISOString()
          };
          
          localStorage.setItem('agentrouter_user', JSON.stringify(userData));
          
          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          
          // Obtener la URL de redirección del parámetro 'next' o usar por defecto '/admin'
          const nextUrl = searchParams.get('next') || '/admin';
          
          setTimeout(() => {
            router.push(nextUrl);
          }, 2000);
          return;
        }

        // Si no hay sesión, intentar manejar parámetros de URL directamente
        const code = searchParams.get('code');
        if (code) {
          // Intercambiar el código por una sesión
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error intercambiando código:', error);
            setStatus('error');
            setMessage('Error en la autenticación. Intenta de nuevo.');
            setTimeout(() => router.push('/login'), 3000);
            return;
          }

          if (data.session) {
            console.log('Sesión establecida vía código:', data.session);
            
            // Sincronizar usuario con nuestra tabla personalizada
            await syncOAuthUserWithDatabase(data.session.user);
            
            // Crear y guardar datos del usuario en localStorage para que AuthContext los cargue
            const userData = {
              id: data.session.user.id,
              name: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name || 'Usuario',
              email: data.session.user.email || '',
              company: '',
              plan: 'free',
              api_key_limit: 1000,
              is_active: true,
              email_verified: true,
              created_at: data.session.user.created_at || new Date().toISOString()
            };
            
            localStorage.setItem('agentrouter_user', JSON.stringify(userData));
            
            setStatus('success');
            setMessage('¡Autenticación exitosa! Redirigiendo...');
            
            const nextUrl = searchParams.get('next') || '/admin';
            setTimeout(() => {
              router.push(nextUrl);
            }, 2000);
            return;
          }
        }

        // Manejar verificación de email tradicional si no es OAuth
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        console.log('Email verification params:', { accessToken, refreshToken, type });

        if (type === 'signup' && accessToken) {
          // Establecer la sesión con los tokens
          const { data: sessionData2, error: sessionError2 } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken!
          });

          if (sessionError2) {
            console.error('Error setting session:', sessionError2);
            setStatus('error');
            setMessage('Error verificando tu email. Intenta de nuevo.');
            return;
          }

          console.log('Email verificado exitosamente:', sessionData2);
          setStatus('success');
          setMessage('¡Email verificado exitosamente! Redirigiendo...');
          
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            router.push('/admin');
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
