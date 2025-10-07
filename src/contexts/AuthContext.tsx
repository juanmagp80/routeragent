"use client";

import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/database';

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

// Función para obtener datos del usuario desde la tabla users usando el ID de Supabase Auth
const fetchUserFromDatabase = async (supabaseUserId: string): Promise<User | null> => {
    try {
        console.log('📊 Obteniendo datos del usuario:', supabaseUserId);
        
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.log('👤 Usuario no existe en tabla users, creando...');
                return null; // Usuario no existe, será creado
            }
            throw error;
        }

        console.log('✅ Datos del usuario obtenidos:', userData);
        return userData as User;
    } catch (error) {
        console.error('❌ Error obteniendo datos del usuario:', error);
        return null;
    }
};

// Función para crear usuario en la tabla users si no existe
const createUserInDatabase = async (supabaseUser: any): Promise<User | null> => {
    try {
        console.log('🆕 Creando usuario en base de datos:', supabaseUser);
        
        const newUser = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || 
                  supabaseUser.user_metadata?.name || 
                  supabaseUser.email?.split('@')[0] || 
                  'Usuario',
            company: '',
            plan: 'free',
            api_key_limit: 3,
            is_active: true,
            email_verified: true,
            preferences: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: createdUser, error } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('✅ Usuario creado exitosamente:', createdUser);
        return createdUser as User;
    } catch (error) {
        console.error('❌ Error creando usuario:', error);
        return null;
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();

    // Función para obtener y sincronizar el usuario
    const refreshUser = async () => {
        try {
            console.log('🔄 Refrescando datos del usuario...');
            
            // Obtener sesión actual de Supabase
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error('❌ Error obteniendo sesión:', sessionError);
                setUser(null);
                return;
            }

            if (session?.user) {
                console.log('✅ Sesión activa encontrada:', session.user.email);
                console.log('🔍 ID del usuario:', session.user.id);
                console.log('🔍 Metadata del usuario:', session.user.user_metadata);
                
                // Intentar obtener usuario de la base de datos
                let userData = await fetchUserFromDatabase(session.user.id);
                
                // Si no existe, crearlo
                if (!userData) {
                    console.log('⚠️ Usuario no existe en tabla users, creando...');
                    userData = await createUserInDatabase(session.user);
                } else {
                    console.log('✅ Usuario ya existe en tabla users:', userData.name);
                }
                
                if (userData) {
                    console.log('✅ Usuario final para setUser:', userData);
                    setUser(userData);
                    // Guardar en localStorage para uso offline
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('agentrouter_user', JSON.stringify(userData));
                        console.log('💾 Usuario guardado en localStorage');
                    }
                } else {
                    console.log('❌ No se pudo obtener/crear usuario, setUser(null)');
                    setUser(null);
                }
            } else {
                console.log('❌ No hay sesión activa');
                setUser(null);
                // Limpiar localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('agentrouter_user');
                }
            }
        } catch (error) {
            console.error('❌ Error refrescando usuario:', error);
            setUser(null);
        }
    };

    // Función de login personalizada (para retrocompatibilidad)
    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setAuthError(null);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                await refreshUser();
                router.push('/admin/analytics');
            }
        } catch (error: any) {
            console.error('Error de login:', error);
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Función de registro personalizada (para retrocompatibilidad)
    const register = async (name: string, email: string, password: string) => {
        try {
            setLoading(true);
            setAuthError(null);
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        full_name: name
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                await refreshUser();
                router.push('/admin/analytics');
            }
        } catch (error: any) {
            console.error('Error de registro:', error);
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Función de logout
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error during logout:', error);
            }
            
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('agentrouter_user');
            }
            router.push('/login');
        } catch (error) {
            console.error('Error in logout function:', error);
        }
    };

    // Inicialización y listener de auth
    useEffect(() => {
        setIsHydrated(true);
        
        // Cargar usuario inicial
        refreshUser().finally(() => setLoading(false));

        // Listener para cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('🔐 Auth state cambió:', event, session?.user?.email);
                
                if (event === 'SIGNED_IN') {
                    await refreshUser();
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('agentrouter_user');
                    }
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            isHydrated,
            authError,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
