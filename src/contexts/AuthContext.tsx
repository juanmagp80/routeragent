"use client";

import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { BACKEND_URL } from '@/config/backend';

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

    // Función para obtener datos reales del usuario desde el backend
    const fetchUserData = async (): Promise<User | null> => {
        try {
            console.log('👤 Fetching real user data from user endpoint...');
            const response = await fetch(`${BACKEND_URL}/v1/user-dev`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('👤 User data received:', data);
            
            if (data.success && data.user) {
                return data.user;
            }
            
            return null;
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
                id: '1',
                name: 'Usuario Demo',
                email: email,
                company: 'Demo Company',
                plan: 'pro',
                api_key_limit: 10,
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
                id: '1',
                name: name,
                email: email,
                plan: 'starter',
                api_key_limit: 3,
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

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        loading,
        isHydrated,
        authError,
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
