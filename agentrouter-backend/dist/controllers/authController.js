"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.verifyEmail = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const authService = new authService_1.AuthService();
// Registrar un nuevo usuario
const register = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            error: 'Failed to register user',
            success: false
        });
    }
};
exports.register = register;
// Iniciar sesión de usuario
const login = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            error: 'Failed to login',
            success: false
        });
    }
};
exports.login = login;
// Cerrar sesión de usuario
const logout = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({
            error: 'Failed to logout',
            success: false
        });
    }
};
exports.logout = logout;
// Obtener usuario actual
const getCurrentUser = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({
            error: 'Failed to get current user',
            success: false
        });
    }
};
exports.getCurrentUser = getCurrentUser;
// Verificar correo electrónico
const verifyEmail = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({
            error: 'Failed to verify email',
            success: false
        });
    }
};
exports.verifyEmail = verifyEmail;
// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({
            error: 'Failed to request password reset',
            success: false
        });
    }
};
exports.requestPasswordReset = requestPasswordReset;
// Restablecer contraseña
const resetPassword = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            error: 'Failed to reset password',
            success: false
        });
    }
};
exports.resetPassword = resetPassword;
