import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
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

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            // En una implementación real, aquí se verificaría el token JWT
            // Simular usuario autenticado
            setUser({
                id: '1',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin'
            });
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