"use client";

import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/database';
import { frontendAuthService, User } from '../services/frontendAuthService';
import { robustRedirect } from '../utils/redirect';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isHydrated: boolean;
    authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setIsHydrated(true);
        // Solo acceder a localStorage después de la hidratación
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('agentrouter_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        checkUserSession();
        // Escuchar cambios en la autenticación de Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session);
                if (event === 'SIGNED_IN' && session?.user) {
                    console.log('SIGNED_IN detectado, cargando datos del usuario...');
                    setLoading(true);
                    await loadUserData(session.user.id);
                    setLoading(false);
                    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
                        console.log('🔄 Iniciando redirección robusta a /user...');
                        robustRedirect('/user');
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log('SIGNED_OUT detectado, limpiando estado...');
                    setUser(null);
                    setLoading(false);
                    router.push('/login');
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    console.log('TOKEN_REFRESHED detectado, actualizando datos...');
                    await loadUserData(session.user.id);
                }
            }
        );
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkUserSession = async () => {
        console.log('🔍 Verificando sesión inicial...');
        let timeoutId: NodeJS.Timeout | null = null;
        try {
            // Timeout de 8 segundos para detectar cuelgues
            timeoutId = setTimeout(() => {
                setAuthError('Timeout al consultar usuario. Verifica tu conexión o el backend.');
                setLoading(false);
                console.error('⏰ Timeout en checkUserSession');
            }, 8000);

            const result = await frontendAuthService.getCurrentUser();
            console.log('🔍 Resultado de verificación de sesión:', result);

            if (result.success && result.user) {
                console.log('✅ Sesión encontrada:', result.user);
                setUser(result.user);
                localStorage.setItem('agentrouter_user', JSON.stringify(result.user));
                setAuthError(null);
            } else {
                console.log('❌ No se encontró sesión activa:', result.error);
                localStorage.removeItem('agentrouter_user');
                setAuthError(result.error || 'No se pudo cargar el usuario');
            }
        } catch (error) {
            console.error('❌ Error checking user session:', error);
            localStorage.removeItem('agentrouter_user');
            setAuthError('Error inesperado al cargar el usuario');
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            console.log('🔍 Finalizando verificación de sesión, setting loading to false');
            setLoading(false);
        }
    };

    const loadUserData = async (userId: string) => {
        try {
            console.log('Cargando datos del usuario:', userId);
            const result = await frontendAuthService.getCurrentUser();

            if (result.success && result.user) {
                console.log('Datos del usuario cargados exitosamente:', result.user);
                setUser(result.user);
                localStorage.setItem('agentrouter_user', JSON.stringify(result.user));
            } else {
                console.error('Error cargando datos del usuario:', result.error);
                const { data: authData } = await supabase.auth.getUser();
                if (authData.user) {
                    const minimalUser: User = {
                        id: authData.user.id,
                        email: authData.user.email!,
                        name: authData.user.user_metadata?.name || '',
                        company: authData.user.user_metadata?.company || null,
                        plan: 'free',
                        api_key_limit: 3,
                        is_active: true,
                        email_verified: authData.user.email_confirmed_at !== null,
                        created_at: authData.user.created_at,
                        updated_at: authData.user.updated_at || authData.user.created_at
                    };
                    console.log('Usando datos mínimos del usuario:', minimalUser);
                    setUser(minimalUser);
                    localStorage.setItem('agentrouter_user', JSON.stringify(minimalUser));
                } else {
                    localStorage.removeItem('agentrouter_user');
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            console.log('Iniciando login con:', email);

            // Solo hacer la autenticación, el listener onAuthStateChange se encargará del resto
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Error de login:', error);
                let errorMessage = "Error al iniciar sesión";

                if (error.message === 'Invalid login credentials') {
                    errorMessage = "Email o contraseña incorrectos";
                } else if (error.message === 'Email not confirmed' || error.message.includes('Email not confirmed')) {
                    errorMessage = "Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
                }

                throw new Error(errorMessage);
            }

            if (!data.user || !data.session) {
                throw new Error('No se pudo obtener la sesión de usuario');
            }

            console.log('Login exitoso, esperando que onAuthStateChange maneje la redirección...');
            // El listener onAuthStateChange se encargará de:
            // 1. Cargar los datos del usuario
            // 2. Establecer el estado
            // 3. Redirigir al dashboard

        } catch (error: any) {
            setLoading(false); // Solo establecer loading en false si hay error
            throw new Error(error.message || 'Error al iniciar sesión');
        }
        // No establecer loading en false aquí, el listener lo hará
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            const result = await frontendAuthService.register({ name, email, password });

            if (!result.success) {
                throw new Error(result.error || 'Error al registrarse');
            }

            if (result.user) {
                setUser(result.user);
                router.push('/login?message=Registro exitoso. Por favor verifica tu email.');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await frontendAuthService.logout();
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('agentrouter_user');
            router.push('/');
        }
    };

    const value = {
    user,
    login,
    register,
    logout,
    loading,
    isHydrated,
    authError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}