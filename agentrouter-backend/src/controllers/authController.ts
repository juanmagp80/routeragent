import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

// Registrar un nuevo usuario
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validar datos requeridos
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Email, password, and name are required',
                success: false
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                success: false
            });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long',
                success: false
            });
        }

        const { user, error } = await authService.register({ email, password, name });

        if (error) {
            return res.status(400).json({
                error: error,
                success: false
            });
        }

        res.status(201).json({
            user,
            success: true,
            message: 'User registered successfully. Please check your email for verification.'
        });
    } catch (error: any) {
        console.error('Error registering user:', error);
        res.status(500).json({
            error: 'Failed to register user',
            success: false
        });
    }
};

// Iniciar sesión de usuario
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validar datos requeridos
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
                success: false
            });
        }

        const { user, error } = await authService.login(email, password);

        if (error) {
            return res.status(401).json({
                error: error,
                success: false
            });
        }

        res.json({
            user,
            success: true,
            message: 'Login successful'
        });
    } catch (error: any) {
        console.error('Error logging in:', error);
        res.status(500).json({
            error: 'Failed to login',
            success: false
        });
    }
};

// Cerrar sesión de usuario
export const logout = async (req: Request, res: Response) => {
    try {
        const { error } = await authService.logout();

        if (error) {
            return res.status(500).json({
                error: error,
                success: false
            });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error: any) {
        console.error('Error logging out:', error);
        res.status(500).json({
            error: 'Failed to logout',
            success: false
        });
    }
};

// Obtener usuario actual
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const { user, error } = await authService.getCurrentUser();

        if (error) {
            return res.status(500).json({
                error: error,
                success: false
            });
        }

        if (!user) {
            return res.status(401).json({
                error: 'Not authenticated',
                success: false
            });
        }

        res.json({
            user,
            success: true
        });
    } catch (error: any) {
        console.error('Error getting current user:', error);
        res.status(500).json({
            error: 'Failed to get current user',
            success: false
        });
    }
};

// Verificar correo electrónico
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token, email } = req.body;

        // Validar datos requeridos
        if (!token || !email) {
            return res.status(400).json({
                error: 'Token and email are required',
                success: false
            });
        }

        const { user, error } = await authService.verifyEmail(token, email);

        if (error) {
            return res.status(400).json({
                error: error,
                success: false
            });
        }

        res.json({
            user,
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error: any) {
        console.error('Error verifying email:', error);
        res.status(500).json({
            error: 'Failed to verify email',
            success: false
        });
    }
};

// Solicitar restablecimiento de contraseña
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Validar datos requeridos
        if (!email) {
            return res.status(400).json({
                error: 'Email is required',
                success: false
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                success: false
            });
        }

        const { error } = await authService.requestPasswordReset(email);

        if (error) {
            return res.status(400).json({
                error: error,
                success: false
            });
        }

        res.json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    } catch (error: any) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({
            error: 'Failed to request password reset',
            success: false
        });
    }
};

// Restablecer contraseña
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, token, newPassword } = req.body;

        // Validar datos requeridos
        if (!email || !token || !newPassword) {
            return res.status(400).json({
                error: 'Email, token, and new password are required',
                success: false
            });
        }

        // Validar longitud de contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long',
                success: false
            });
        }

        const { error } = await authService.resetPassword(email, token, newPassword);

        if (error) {
            return res.status(400).json({
                error: error,
                success: false
            });
        }

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error: any) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            error: 'Failed to reset password',
            success: false
        });
    }
};