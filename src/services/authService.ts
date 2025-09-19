// Servicio de autenticación para AgentRouter

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { CreateUserInput, LoginInput, UpdateUserInput, User } from '../models/User';

// Clave secreta para JWT (en producción, usar variable de entorno)
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-minimum-32-characters-long';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export class AuthService {
    // Registrar nuevo usuario
    async register(userData: CreateUserInput): Promise<{
        success: boolean;
        user?: Omit<User, 'password_hash'>;
        token?: string;
        refresh_token?: string;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!userData.email || !userData.password || !userData.name) {
                return {
                    success: false,
                    error: "Email, password, and name are required"
                };
            }

            // Verificar que el email no esté en uso
            const { data: existingUser, error: existingUserError } = await supabase
                .from('users')
                .select('*')
                .eq('email', userData.email)
                .maybeSingle();

            if (existingUserError) {
                throw new Error(`Database error: ${existingUserError.message}`);
            }

            if (existingUser) {
                return {
                    success: false,
                    error: "Email already in use"
                };
            }

            // Hashear contraseña
            const saltRounds = 12;
            const password_hash = await bcrypt.hash(userData.password, saltRounds);

            // Crear usuario en Supabase
            const { data: newUser, error: createUserError } = await supabase
                .from('users')
                .insert([{
                    email: userData.email,
                    password_hash: password_hash,
                    name: userData.name,
                    company: userData.company || null,
                    plan: userData.plan || 'starter',
                    api_key_limit: userData.plan === 'starter' ? 1 : userData.plan === 'pro' ? 5 : -1, // -1 para ilimitado
                    usage_limit: userData.plan === 'starter' ? 1000 : userData.plan === 'pro' ? 5000 : -1, // -1 para ilimitado
                    usage_count: 0,
                    is_active: true,
                    email_verified: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    two_factor_enabled: false,
                    failed_login_attempts: 0
                }])
                .select()
                .single();

            if (createUserError) {
                throw new Error(`Failed to create user: ${createUserError.message}`);
            }

            // Generar tokens JWT
            const token = jwt.sign({
                userId: newUser.id,
                email: newUser.email,
                plan: newUser.plan
            }, JWT_SECRET, { expiresIn: '24h' });

            const refresh_token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

            // Eliminar campos sensibles antes de devolver
            const { password_hash: _, ...safeUser } = newUser;

            return {
                success: true,
                user: safeUser,
                token,
                refresh_token,
                message: "User registered successfully"
            };

        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: "Failed to register user"
            };
        }
    }

    // Iniciar sesión de usuario
    async login(credentials: LoginInput): Promise<{
        success: boolean;
        user?: Omit<User, 'password_hash'>;
        token?: string;
        refresh_token?: string;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!credentials.email || !credentials.password) {
                return {
                    success: false,
                    error: "Email and password are required"
                };
            }

            // Buscar usuario por email
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', credentials.email)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                return {
                    success: false,
                    error: "Invalid email or password"
                };
            }

            // Verificar si la cuenta está activa
            if (!user.is_active) {
                return {
                    success: false,
                    error: "Account is deactivated"
                };
            }

            // Verificar si la cuenta está bloqueada
            if (user.locked_until && new Date(user.locked_until) > new Date()) {
                return {
                    success: false,
                    error: "Account is locked. Try again later."
                };
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
            if (!isValidPassword) {
                // Incrementar intentos fallidos
                const failedAttempts = user.failed_login_attempts + 1;
                let lockedUntil = null;

                // Bloquear cuenta después de 5 intentos fallidos
                if (failedAttempts >= 5) {
                    lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos
                }

                await supabase
                    .from('users')
                    .update({
                        failed_login_attempts: failedAttempts,
                        locked_until: lockedUntil
                    })
                    .eq('id', user.id);

                return {
                    success: false,
                    error: "Invalid email or password"
                };
            }

            // Reiniciar intentos fallidos
            await supabase
                .from('users')
                .update({
                    failed_login_attempts: 0,
                    locked_until: null,
                    last_login: new Date().toISOString()
                })
                .eq('id', user.id);

            // Generar tokens JWT
            const token = jwt.sign({
                userId: user.id,
                email: user.email,
                plan: user.plan
            }, JWT_SECRET, { expiresIn: '24h' });

            const refresh_token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

            // Eliminar campos sensibles antes de devolver
            const { password_hash: _, ...safeUser } = user;

            return {
                success: true,
                user: safeUser,
                token,
                refresh_token,
                message: "Login successful"
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: "Failed to login"
            };
        }
    }

    // Verificar token JWT
    async verifyToken(token: string): Promise<{
        success: boolean;
        user?: Omit<User, 'password_hash'>;
        message?: string;
        error?: string;
    }> {
        try {
            // Verificar token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Buscar usuario por ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', (decoded as any).userId)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Verificar si la cuenta está activa
            if (!user.is_active) {
                return {
                    success: false,
                    error: "Account is deactivated"
                };
            }

            // Eliminar campos sensibles antes de devolver
            const { password_hash: _, ...safeUser } = user;

            return {
                success: true,
                user: safeUser,
                message: "Token verified successfully"
            };

        } catch (error) {
            console.error('Token verification error:', error);
            return {
                success: false,
                error: "Invalid or expired token"
            };
        }
    }

    // Actualizar usuario
    async updateUser(userId: string, updateData: UpdateUserInput): Promise<{
        success: boolean;
        user?: Omit<User, 'password_hash'>;
        message?: string;
        error?: string;
    }> {
        try {
            // Verificar que el usuario exista
            const { data: existingUser, error: existingUserError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (existingUserError) {
                throw new Error(`Database error: ${existingUserError.message}`);
            }

            if (!existingUser) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Preparar datos para actualizar
            const updatePayload: any = {
                updated_at: new Date().toISOString()
            };

            // Actualizar campos permitidos
            if (updateData.name !== undefined) updatePayload.name = updateData.name;
            if (updateData.company !== undefined) updatePayload.company = updateData.company;
            if (updateData.timezone !== undefined) updatePayload.timezone = updateData.timezone;
            if (updateData.language !== undefined) updatePayload.language = updateData.language;
            if (updateData.bio !== undefined) updatePayload.bio = updateData.bio;
            if (updateData.website !== undefined) updatePayload.website = updateData.website;
            if (updateData.phone !== undefined) updatePayload.phone = updateData.phone;

            // Actualizar dirección de facturación
            if (updateData.billing_address) {
                updatePayload.billing_address = {
                    ...existingUser.billing_address,
                    ...updateData.billing_address
                };
            }

            // Actualizar perfiles sociales
            if (updateData.social_profiles) {
                updatePayload.social_profiles = {
                    ...existingUser.social_profiles,
                    ...updateData.social_profiles
                };
            }

            // Actualizar preferencias
            if (updateData.preferences) {
                updatePayload.preferences = {
                    ...existingUser.preferences,
                    ...updateData.preferences
                };
            }

            // Actualizar usuario en Supabase
            const { data: updatedUser, error: updateUserError } = await supabase
                .from('users')
                .update(updatePayload)
                .eq('id', userId)
                .select()
                .single();

            if (updateUserError) {
                throw new Error(`Failed to update user: ${updateUserError.message}`);
            }

            // Eliminar campos sensibles antes de devolver
            const { password_hash: _, ...safeUser } = updatedUser;

            return {
                success: true,
                user: safeUser,
                message: "User updated successfully"
            };

        } catch (error) {
            console.error('Update user error:', error);
            return {
                success: false,
                error: "Failed to update user"
            };
        }
    }

    // Cambiar contraseña
    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!currentPassword || !newPassword) {
                return {
                    success: false,
                    error: "Current password and new password are required"
                };
            }

            // Verificar que las contraseñas sean diferentes
            if (currentPassword === newPassword) {
                return {
                    success: false,
                    error: "New password must be different from current password"
                };
            }

            // Verificar que la nueva contraseña tenga al menos 8 caracteres
            if (newPassword.length < 8) {
                return {
                    success: false,
                    error: "New password must be at least 8 characters long"
                };
            }

            // Buscar usuario por ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('password_hash')
                .eq('id', userId)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Verificar contraseña actual
            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValidPassword) {
                return {
                    success: false,
                    error: "Current password is incorrect"
                };
            }

            // Hashear nueva contraseña
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar contraseña en Supabase
            const { error: updatePasswordError } = await supabase
                .from('users')
                .update({
                    password_hash: newPasswordHash,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updatePasswordError) {
                throw new Error(`Failed to update password: ${updatePasswordError.message}`);
            }

            return {
                success: true,
                message: "Password changed successfully"
            };

        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                error: "Failed to change password"
            };
        }
    }

    // Solicitar restablecimiento de contraseña
    async requestPasswordReset(email: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!email) {
                return {
                    success: false,
                    error: "Email is required"
                };
            }

            // Verificar que el usuario exista
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                // No revelar si el email existe por razones de seguridad
                return {
                    success: true,
                    message: "If your email is registered, you will receive a password reset link"
                };
            }

            // Generar token de restablecimiento
            const resetToken = jwt.sign({ userId: user.id, action: 'reset_password' }, JWT_SECRET, { expiresIn: '1h' });

            // Guardar token en la base de datos
            const { error: updateTokenError } = await supabase
                .from('users')
                .update({
                    password_reset_token: resetToken,
                    password_reset_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateTokenError) {
                throw new Error(`Failed to save reset token: ${updateTokenError.message}`);
            }

            // En una implementación real, aquí se enviaría un email con el token
            // Por ahora, solo simulamos el proceso
            console.log(`Password reset token for ${email}: ${resetToken}`);

            return {
                success: true,
                message: "If your email is registered, you will receive a password reset link"
            };

        } catch (error) {
            console.error('Request password reset error:', error);
            return {
                success: false,
                error: "Failed to request password reset"
            };
        }
    }

    // Restablecer contraseña
    async resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!token || !newPassword) {
                return {
                    success: false,
                    error: "Token and new password are required"
                };
            }

            // Verificar que la nueva contraseña tenga al menos 8 caracteres
            if (newPassword.length < 8) {
                return {
                    success: false,
                    error: "New password must be at least 8 characters long"
                };
            }

            // Verificar token
            let decoded: any;
            try {
                const payload = jwt.verify(token, JWT_SECRET);
                decoded = payload;
            } catch (error) {
                return {
                    success: false,
                    error: "Invalid or expired reset token"
                };
            }

            // Verificar que el token sea para restablecer contraseña
            if (decoded.action !== 'reset_password') {
                return {
                    success: false,
                    error: "Invalid reset token"
                };
            }

            // Buscar usuario por ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('password_reset_expires')
                .eq('id', decoded.userId)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Verificar que el token no haya expirado
            if (!user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
                return {
                    success: false,
                    error: "Reset token has expired"
                };
            }

            // Hashear nueva contraseña
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar contraseña y limpiar token en Supabase
            const { error: updatePasswordError } = await supabase
                .from('users')
                .update({
                    password_hash: newPasswordHash,
                    password_reset_token: null,
                    password_reset_expires: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', decoded.userId);

            if (updatePasswordError) {
                throw new Error(`Failed to reset password: ${updatePasswordError.message}`);
            }

            return {
                success: true,
                message: "Password reset successfully"
            };

        } catch (error) {
            console.error('Reset password error:', error);
            return {
                success: false,
                error: "Failed to reset password"
            };
        }
    }

    // Verificar email
    async verifyEmail(token: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!token) {
                return {
                    success: false,
                    error: "Verification token is required"
                };
            }

            // Verificar token
            let decoded: any;
            try {
                const payload = jwt.verify(token, JWT_SECRET);
                decoded = payload;
            } catch (error) {
                return {
                    success: false,
                    error: "Invalid or expired verification token"
                };
            }

            // Verificar que el token sea para verificar email
            if (decoded.action !== 'verify_email') {
                return {
                    success: false,
                    error: "Invalid verification token"
                };
            }

            // Buscar usuario por ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('email_verified')
                .eq('id', decoded.userId)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Verificar que el email no esté ya verificado
            if (user.email_verified) {
                return {
                    success: true,
                    message: "Email already verified"
                };
            }

            // Actualizar estado de verificación en Supabase
            const { error: updateVerificationError } = await supabase
                .from('users')
                .update({
                    email_verified: true,
                    email_verification_token: null,
                    email_verification_expires: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', decoded.userId);

            if (updateVerificationError) {
                throw new Error(`Failed to verify email: ${updateVerificationError.message}`);
            }

            return {
                success: true,
                message: "Email verified successfully"
            };

        } catch (error) {
            console.error('Verify email error:', error);
            return {
                success: false,
                error: "Failed to verify email"
            };
        }
    }

    // Habilitar 2FA
    async enable2FA(userId: string, secret: string, token: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!secret || !token) {
                return {
                    success: false,
                    error: "Secret and token are required"
                };
            }

            // En una implementación real, aquí se verificaría el token TOTP
            // Por ahora, solo simulamos el proceso
            console.log(`2FA verification for user ${userId}: ${token} with secret ${secret}`);

            // Actualizar estado de 2FA en Supabase
            const { error: update2FAError } = await supabase
                .from('users')
                .update({
                    two_factor_enabled: true,
                    two_factor_secret: secret,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (update2FAError) {
                throw new Error(`Failed to enable 2FA: ${update2FAError.message}`);
            }

            return {
                success: true,
                message: "Two-factor authentication enabled successfully"
            };

        } catch (error) {
            console.error('Enable 2FA error:', error);
            return {
                success: false,
                error: "Failed to enable two-factor authentication"
            };
        }
    }

    // Deshabilitar 2FA
    async disable2FA(userId: string, password: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!password) {
                return {
                    success: false,
                    error: "Password is required"
                };
            }

            // Buscar usuario por ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('password_hash')
                .eq('id', userId)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return {
                    success: false,
                    error: "Invalid password"
                };
            }

            // Actualizar estado de 2FA en Supabase
            const { error: update2FAError } = await supabase
                .from('users')
                .update({
                    two_factor_enabled: false,
                    two_factor_secret: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (update2FAError) {
                throw new Error(`Failed to disable 2FA: ${update2FAError.message}`);
            }

            return {
                success: true,
                message: "Two-factor authentication disabled successfully"
            };

        } catch (error) {
            console.error('Disable 2FA error:', error);
            return {
                success: false,
                error: "Failed to disable two-factor authentication"
            };
        }
    }

    // Verificar 2FA
    async verify2FA(userId: string, token: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Validar entrada
            if (!token) {
                return {
                    success: false,
                    error: "Token is required"
                };
            }

            // Buscar usuario por ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('two_factor_secret')
                .eq('id', userId)
                .maybeSingle();

            if (userError) {
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Verificar que 2FA esté habilitado
            if (!user.two_factor_secret) {
                return {
                    success: false,
                    error: "Two-factor authentication is not enabled for this user"
                };
            }

            // En una implementación real, aquí se verificaría el token TOTP
            // Por ahora, solo simulamos el proceso
            console.log(`2FA verification for user ${userId}: ${token} with secret ${user.two_factor_secret}`);

            return {
                success: true,
                message: "Two-factor authentication verified successfully"
            };

        } catch (error) {
            console.error('Verify 2FA error:', error);
            return {
                success: false,
                error: "Failed to verify two-factor authentication"
            };
        }
    }
}