import { BACKEND_URL } from '@/config/backend';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    plan?: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const token = localStorage.getItem('token');

            // En desarrollo, siempre intentar cargar datos del usuario
            // En producción, solo si hay token
            if (!token && process.env.NODE_ENV === 'production') {
                setUser(null);
                setLoading(false);
                return;
            }

            // Si no hay token en desarrollo, crear uno temporal
            if (!token) {
                localStorage.setItem('token', 'dev-token-temp');
            }

            // Obtener datos reales del usuario desde el backend
            console.log('🔍 Fetching user data from:', `${BACKEND_URL}/v1/user-dev`);
            const response = await fetch(`${BACKEND_URL}/v1/user-dev`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('📡 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('📝 User data received:', data);

                if (data.success && data.user) {
                    const userData = {
                        id: data.user.id,
                        name: data.user.name?.replace(/ - Test$/i, '') || data.user.name, // Limpiar " - Test" del nombre
                        email: data.user.email,
                        role: 'admin', // Por ahora todos son admin
                        plan: data.user.plan
                    };
                    console.log('✅ Setting user data:', userData);
                    setUser(userData);
                } else {
                    console.warn('❌ Invalid user data response:', data);
                    setUser(null);
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to fetch user data, status:', response.status, 'response:', errorText);
                setUser(null);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        try {
            // En una implementación real, aquí se haría la llamada a la API de autenticación
            if (email === 'admin@example.com' && password === 'password') {
                // Simular token JWT
                const token = 'simulated-jwt-token';
                localStorage.setItem('token', token);

                setUser({
                    id: '1',
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin'
                });

                return { success: true };
            } else {
                return { success: false, error: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    }

    async function logout() {
        try {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    return {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };
}