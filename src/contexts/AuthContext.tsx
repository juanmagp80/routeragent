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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();

    // Cargar usuario desde localStorage al inicializar y actualizar con datos reales
    useEffect(() => {
        const initializeUser = async () => {
            if (typeof window !== 'undefined') {
                const savedUser = localStorage.getItem('agentrouter_user');
                if (savedUser) {
                    try {
                        const userData = JSON.parse(savedUser);
                        setUser(userData);

                        // Actualizar con datos reales del backend
                        const realUserData = await fetchUserData();
                        if (realUserData) {
                            setUser(realUserData);
                            localStorage.setItem('agentrouter_user', JSON.stringify(realUserData));
                        }
                    } catch (error) {
                        console.warn('Error parsing saved user data:', error);
                        localStorage.removeItem('agentrouter_user');
                    }
                } else {
                    // Si no hay usuario guardado pero estamos en una página admin, obtener datos
                    if (window.location.pathname.startsWith('/admin')) {
                        const realUserData = await fetchUserData();
                        if (realUserData) {
                            setUser(realUserData);
                            localStorage.setItem('agentrouter_user', JSON.stringify(realUserData));
                        }
                    }
                }
            }
        };

        initializeUser();
    }, []);

    // Escuchar cambios en localStorage para sincronizar datos del usuario
    useEffect(() => {
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
    }, []);

    // Función para obtener datos reales del usuario desde Supabase
    const fetchUserData = async (): Promise<User | null> => {
        try {
            console.log('� === AUTHCONTEXT: INICIO FETCH USER DATA ===');

            // Importar supabase aquí para evitar problemas de SSR
            const { supabase } = await import('../config/database');

            // Obtener usuario autenticado de Supabase
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            console.log('🔍 AuthUser de Supabase:', JSON.stringify(authUser, null, 2));
            console.log('🔍 AuthError:', authError);

            if (authError || !authUser) {
                console.log('❌ No authenticated user found:', authError);
                return null;
            }

            console.log('🔍 Buscando usuario en BD con ID:', authUser.id);

            // Obtener datos del usuario de nuestra tabla personalizada
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            console.log('🔍 UserData de BD:', JSON.stringify(userData, null, 2));
            console.log('🔍 UserError:', userError);

            if (userError) {
                console.error('❌ Error fetching user data from database:', userError);

                // Si el usuario no existe en la tabla personalizada, usar datos de auth
                if (userError.code === 'PGRST116') {
                    console.log('⚠️ Usuario no encontrado en tabla personalizada, usando datos de auth');
                    const user: User = {
                        id: authUser.id,
                        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || 'Usuario',
                        email: authUser.email || '',
                        company: '',
                        plan: 'free',
                        api_key_limit: 1000,
                        is_active: true,
                        email_verified: true,
                        created_at: authUser.created_at || new Date().toISOString()
                    };
                    return user;
                }

                return null;
            }

            // Convertir a formato de nuestro User interface
            const user: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                company: userData.company || '',
                plan: userData.plan || 'free',
                api_key_limit: userData.api_usage_limit || 1000,
                is_active: true,
                email_verified: true,
                created_at: userData.created_at
            };

            console.log('✅ Usuario formateado para AuthContext:', JSON.stringify(user, null, 2));
            console.log('🔍 === AUTHCONTEXT: FIN FETCH USER DATA ===');
            return user;
        } catch (error) {
            console.error('❌ Error fetching user data:', error);
            return null;
        }
    };

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
            localStorage.setItem('agentrouter_user', JSON.stringify(mockUser));

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
            localStorage.setItem('agentrouter_user', JSON.stringify(mockUser));

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
        localStorage.removeItem('agentrouter_user');
        router.push('/login');
    };

    const refreshUser = async () => {
        console.log('🔄 Refreshing user data...');
        const realUserData = await fetchUserData();
        if (realUserData) {
            setUser(realUserData);
            localStorage.setItem('agentrouter_user', JSON.stringify(realUserData));
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
