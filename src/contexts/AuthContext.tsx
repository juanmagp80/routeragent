"use client";

import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Interfaz simplificada para el usuario
export interface User {
    id: string;
    name: string;
    email: string;
    company?: string;
    plan: string;
    api_key_limit: number;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isHydrated: boolean;
    authError: string | null;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para obtener datos reales del usuario desde Supabase
const fetchUserData = async (): Promise<User | null> => {
    try {
        console.log('🔍 === AUTHCONTEXT: INICIO FETCH USER DATA ===');

        // Importar supabase aquí para evitar problemas de SSR
        const { supabase } = await import('../config/database');

        // Verificar si hay una sesión activa de Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔐 Sesión de Supabase:', { session: !!session, error: sessionError });

        // Si no hay sesión y tenemos un usuario guardado, intentar crear una sesión
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('agentrouter_user') : null;
        if (!session && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('🔐 Intentando autenticar usuario en Supabase:', userData.email);
                
                // Intentar sign in silencioso (esto no funcionará con email/password, pero es para RLS)
                // En su lugar, usaremos el service role para esta operación específica
            } catch (error) {
                console.warn('Error parsing saved user for Supabase auth:', error);
            }
        }

        // Obtener usuario de la base de datos
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log('👤 Usuario de auth.getUser():', authUser);

        // Si tenemos usuario autenticado, obtener datos completos
        if (authUser) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (userError) {
                console.error('❌ Error obteniendo datos del usuario:', userError);
                return null;
            }

            if (userData) {
                console.log('✅ Datos del usuario obtenidos:', userData);
                return {
                    id: userData.id,
                    name: userData.name || userData.email,
                    email: userData.email,
                    company: userData.company,
                    plan: userData.plan || 'free',
                    api_key_limit: userData.api_key_limit || 1000,
                    is_active: userData.is_active ?? true,
                    email_verified: userData.email_verified ?? false,
                    created_at: userData.created_at
                };
            }
        }

        // Si no hay usuario autenticado pero tenemos datos guardados, usarlos
        if (typeof window !== 'undefined' && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('📱 Usando datos guardados localmente:', userData);
                return userData;
            } catch (error) {
                console.warn('Error parsing saved user:', error);
            }
        }

        console.log('❌ No se pudo obtener datos del usuario');
        return null;
    } catch (error) {
        console.error('❌ Error en fetchUserData:', error);
        return null;
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();

    // Manejar la hidratación correctamente
    useEffect(() => {
        setIsHydrated(true);

        // Solo ejecutar después de la hidratación
        const initializeUser = async () => {
            try {
                // Verificar si estamos en el cliente
                if (typeof window === 'undefined') return;

                const savedUser = localStorage.getItem('agentrouter_user');
                if (savedUser) {
                    try {
                        const userData = JSON.parse(savedUser);
                        setUser(userData);

                        // Actualizar con datos reales del backend en background
                        fetchUserData().then((realUserData) => {
                            if (realUserData) {
                                setUser(realUserData);
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem('agentrouter_user', JSON.stringify(realUserData));
                                }
                            }
                        }).catch(console.error);
                    } catch (error) {
                        console.warn('Error parsing saved user data:', error);
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('agentrouter_user');
                        }
                    }
                } else {
                    // Si no hay usuario guardado pero estamos en una página admin, obtener datos
                    if (window.location.pathname.startsWith('/admin')) {
                        const realUserData = await fetchUserData();
                        if (realUserData) {
                            setUser(realUserData);
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('agentrouter_user', JSON.stringify(realUserData));
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error initializing user:', error);
            }
        };

        initializeUser();
    }, []);

    // Escuchar cambios en localStorage para sincronizar datos del usuario
    useEffect(() => {
        if (!isHydrated || typeof window === 'undefined') return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'agentrouter_user' && e.newValue) {
                try {
                    const userData = JSON.parse(e.newValue);
                    console.log('🔄 Usuario actualizado desde localStorage:', userData);
                    setUser(userData);
                } catch (error) {
                    console.warn('Error parsing updated user data:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [isHydrated]);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setAuthError(null);

            // Obtener datos reales del usuario desde el backend
            const realUserData = await fetchUserData();

            const mockUser: User = realUserData || {
                id: '3a942f65-25e7-4de3-84cb-3df0268ff759', // ID que coincide con el backend
                name: 'Juan Manuel Garrido - Test',
                email: email,
                company: 'RouterAI Inc',
                plan: 'pro',
                api_key_limit: 5,
                is_active: true,
                email_verified: true,
                created_at: new Date().toISOString()
            };

            setUser(mockUser);
            
            // Solo acceder a localStorage en el cliente
            if (typeof window !== 'undefined') {
                localStorage.setItem('agentrouter_user', JSON.stringify(mockUser));
            }

            // Redirigir al admin
            router.push('/admin');
        } catch (error: any) {
            setAuthError(error.message || 'Error en el login');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            setLoading(true);
            setAuthError(null);

            // Simulación de registro exitoso
            const mockUser: User = {
                id: '3a942f65-25e7-4de3-84cb-3df0268ff759', // ID que coincide con el backend
                name: name,
                email: email,
                plan: 'pro',
                api_key_limit: 5,
                is_active: true,
                email_verified: true,
                created_at: new Date().toISOString()
            };

            setUser(mockUser);
            
            // Solo acceder a localStorage en el cliente
            if (typeof window !== 'undefined') {
                localStorage.setItem('agentrouter_user', JSON.stringify(mockUser));
            }

            // Redirigir al admin
            router.push('/admin');
        } catch (error: any) {
            setAuthError(error.message || 'Error en el registro');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        
        // Solo acceder a localStorage en el cliente
        if (typeof window !== 'undefined') {
            localStorage.removeItem('agentrouter_user');
        }
        
        router.push('/login');
    };

    const refreshUser = async () => {
        console.log('🔄 Refreshing user data...');
        const realUserData = await fetchUserData();
        if (realUserData) {
            setUser(realUserData);
            
            // Solo acceder a localStorage en el cliente
            if (typeof window !== 'undefined') {
                localStorage.setItem('agentrouter_user', JSON.stringify(realUserData));
            }
        }
    };

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        loading,
        isHydrated,
        authError,
        refreshUser,
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
