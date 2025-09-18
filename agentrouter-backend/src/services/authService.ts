import { supabase } from '../config/database';
import { UserResponse } from '../models/User';

export class AuthService {
    // Registrar un nuevo usuario
    async register(userData: { email: string; password: string; name: string }): Promise<{ user: UserResponse | null; error: string | null }> {
        try {
            // Registrar usuario en Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name
                    }
                }
            });

            if (error) {
                return { user: null, error: error.message };
            }

            if (!data.user) {
                return { user: null, error: 'Failed to create user' };
            }

            // Crear perfil de usuario en la tabla 'users'
            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .insert([
                    {
                        id: data.user.id,
                        email: userData.email,
                        name: userData.name,
                        plan: 'starter',
                        api_key_limit: 1,
                        usage_limit: 1000,
                        usage_count: 0,
                        is_active: true,
                        email_verified: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        two_factor_enabled: false,
                        failed_login_attempts: 0,
                        roles: ['user'],
                        permissions: []
                    }
                ])
                .select()
                .single();

            if (profileError) {
                return { user: null, error: profileError.message };
            }

            // Transformar el usuario para la respuesta (excluir campos sensibles)
            const {
                password_hash,
                password_reset_token,
                password_reset_expires,
                email_verification_token,
                email_verification_expires,
                two_factor_secret,
                ...userResponse
            } = userProfile;

            return { user: userResponse, error: null };
        } catch (error: any) {
            return { user: null, error: error.message || 'Failed to register user' };
        }
    }

    // Iniciar sesión de usuario
    async login(email: string, password: string): Promise<{ user: UserResponse | null; error: string | null }> {
        try {
            // Iniciar sesión con Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { user: null, error: error.message };
            }

            if (!data.user) {
                return { user: null, error: 'Failed to login' };
            }

            // Actualizar fecha de último inicio de sesión
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
                .eq('id', data.user.id)
                .select()
                .single();

            if (updateError) {
                return { user: null, error: updateError.message };
            }

            // Transformar el usuario para la respuesta (excluir campos sensibles)
            const {
                password_hash,
                password_reset_token,
                password_reset_expires,
                email_verification_token,
                email_verification_expires,
                two_factor_secret,
                ...userResponse
            } = updatedUser;

            return { user: userResponse, error: null };
        } catch (error: any) {
            return { user: null, error: error.message || 'Failed to login' };
        }
    }

    // Cerrar sesión de usuario
    async logout(): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return { error: error.message };
            }

            return { error: null };
        } catch (error: any) {
            return { error: error.message || 'Failed to logout' };
        }
    }

    // Obtener usuario actual
    async getCurrentUser(): Promise<{ user: UserResponse | null; error: string | null }> {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                return { user: null, error: error.message };
            }

            if (!user) {
                return { user: null, error: null };
            }

            // Obtener perfil de usuario de la tabla 'users'
            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                return { user: null, error: profileError.message };
            }

            // Transformar el usuario para la respuesta (excluir campos sensibles)
            const {
                password_hash,
                password_reset_token,
                password_reset_expires,
                email_verification_token,
                email_verification_expires,
                two_factor_secret,
                ...userResponse
            } = userProfile;

            return { user: userResponse, error: null };
        } catch (error: any) {
            return { user: null, error: error.message || 'Failed to get current user' };
        }
    }

    // Enviar correo de verificación
    async sendVerificationEmail(email: string): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) {
                return { error: error.message };
            }

            return { error: null };
        } catch (error: any) {
            return { error: error.message || 'Failed to send verification email' };
        }
    }

    // Verificar correo electrónico
    async verifyEmail(token: string, email: string): Promise<{ user: UserResponse | null; error: string | null }> {
        try {
            // Verificar el token
            const { data, error } = await supabase.auth.verifyOtp({
                type: 'email',
                token: token,
                email: email
            });

            if (error) {
                return { user: null, error: error.message };
            }

            if (!data.user) {
                return { user: null, error: 'Failed to verify email' };
            }

            // Actualizar estado de verificación en la tabla 'users'
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    email_verified: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', data.user.id)
                .select()
                .single();

            if (updateError) {
                return { user: null, error: updateError.message };
            }

            // Transformar el usuario para la respuesta (excluir campos sensibles)
            const {
                password_hash,
                password_reset_token,
                password_reset_expires,
                email_verification_token,
                email_verification_expires,
                two_factor_secret,
                ...userResponse
            } = updatedUser;

            return { user: userResponse, error: null };
        } catch (error: any) {
            return { user: null, error: error.message || 'Failed to verify email' };
        }
    }

    // Solicitar restablecimiento de contraseña
    async requestPasswordReset(email: string): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                return { error: error.message };
            }

            return { error: null };
        } catch (error: any) {
            return { error: error.message || 'Failed to request password reset' };
        }
    }

    // Restablecer contraseña
    async resetPassword(email: string, token: string, newPassword: string): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase.auth.verifyOtp({
                type: 'recovery',
                token: token,
                email: email
            });

            if (error) {
                return { error: error.message };
            }

            // Actualizar la contraseña
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                return { error: updateError.message };
            }

            return { error: null };
        } catch (error: any) {
            return { error: error.message || 'Failed to reset password' };
        }
    }
}