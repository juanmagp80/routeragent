import { supabase } from '../config/database';

/**
 * Función de utilidad para autenticar al usuario de prueba
 * Debe usarse solo para testing/desarrollo inicial
 */
export async function authenticateTestUser() {
    const testEmail = 'juanmagpdev@gmail.com';
    const testPassword = 'RouterAgent2024!';

    try {
        console.log('🔐 Intentando autenticar usuario de prueba...');

        // Primero intentar hacer login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError && loginError.message.includes('Invalid login credentials')) {
            console.log('👤 Usuario no existe, creando cuenta...');

            // Si no existe, crear la cuenta
            const { data: signupData, error: signupError } = await supabase.auth.signUp({
                email: testEmail,
                password: testPassword,
                options: {
                    data: {
                        name: 'Juan Manuel Garrido',
                        company: 'RouterAgent'
                    }
                }
            });

            if (signupError) {
                console.error('❌ Error creando usuario:', signupError);
                throw signupError;
            }

            console.log('✅ Usuario creado exitosamente');
            return signupData;
        } else if (loginError) {
            console.error('❌ Error en login:', loginError);
            throw loginError;
        } else {
            console.log('✅ Usuario autenticado exitosamente');
            return loginData;
        }

    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        throw error;
    }
}

/**
 * Obtiene el token de acceso actual
 */
export async function getCurrentAccessToken(): Promise<string | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    } catch (error) {
        console.error('❌ Error obteniendo token:', error);
        return null;
    }
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isUserAuthenticated(): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
    } catch (error) {
        return false;
    }
}