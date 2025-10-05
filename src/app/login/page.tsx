"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Chrome, Eye, EyeOff, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/database';
import { OAUTH_CONFIG } from '../../config/oauth';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export default function LoginPage() {
    const { login, loading: authLoading, isHydrated, authError } = useAuth();
    const { showSuccess, showError, showLoading } = useNotifications();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Subtle background animation
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsMounted(true);

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Evitar renderizado hasta que esté hidratado
    if (!isMounted || !isHydrated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-5 rounded-2xl text-lg shadow-xl max-w-md text-center">
                    <div className="mb-2 font-bold text-red-400">Error de autenticación</div>
                    <div>{authError}</div>
                    <div className="mt-4 text-sm text-gray-300">Si el problema persiste, contacta soporte o intenta registrarte de nuevo.</div>
                </div>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setShowEmailVerification(false);
        setIsSubmitting(true);

        try {
            await login(formData.email, formData.password);
            // Si llegamos aquí sin error, el login fue exitoso
            // El listener onAuthStateChange se encargará de la redirección
            console.log('Login iniciado exitosamente, esperando redirección...');
        } catch (err: any) {
            const errorMessage = err.message || 'Error al iniciar sesión';

            if (errorMessage.includes('verifica tu email') || errorMessage.includes('Email no verificado')) {
                setShowEmailVerification(true);
                setVerificationEmail(formData.email);
                setError('Tu cuenta necesita verificación de email. Revisa tu bandeja de entrada.');
            } else {
                setError(errorMessage);
            }
            setIsSubmitting(false); // Solo resetear si hay error
        }
        // No resetear isSubmitting si es exitoso, dejar que la redirección ocurra
    };

    const handleResendVerification = async () => {
        try {
            const { frontendAuthService } = await import('../../services/frontendAuthService');
            const result = await frontendAuthService.resendVerificationEmail(verificationEmail);
            if (result.success) {
                setError('Email de verificación reenviado. Revisa tu bandeja de entrada.');
                setShowEmailVerification(false);
            } else {
                setError(result.error || 'Error reenviando email');
            }
        } catch (error) {
            console.error('Error reenviando email:', error);
            setError('Error reenviando email de verificación');
        }
    };

    // Función para login con proveedores sociales
    const handleSocialLogin = async (provider: 'github' | 'google') => {
        try {
            setSocialLoading(provider);
            const loadingToast = showLoading(`Conectando con ${provider === 'github' ? 'GitHub' : 'Google'}...`);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: OAUTH_CONFIG.redirectTo('/admin'),
                    queryParams: OAUTH_CONFIG.queryParams,
                },
            });

            if (error) {
                throw error;
            }

            // El usuario será redirigido automáticamente
            showSuccess(`Redirigiendo a ${provider === 'github' ? 'GitHub' : 'Google'}...`);

        } catch (error: any) {
            console.error(`Error with ${provider} login:`, error);

            let errorMessage = `Error al conectar con ${provider === 'github' ? 'GitHub' : 'Google'}`;

            if (error.message?.includes('popup_closed')) {
                errorMessage = 'Ventana cerrada. Por favor, inténtalo de nuevo.';
            } else if (error.message?.includes('access_denied')) {
                errorMessage = 'Acceso denegado. Por favor, autoriza la aplicación.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            showError(errorMessage);
            setError(errorMessage);
        } finally {
            setSocialLoading(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Dynamic background gradient */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`
                }}
            />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            <div className="relative z-10 min-h-screen flex">
                {/* Left side - Branding */}
                <motion.div
                    className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="max-w-md">
                        <motion.div
                            className="mb-8"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-emerald-500 rounded-sm" />
                                </div>
                            </div>
                        </motion.div>

                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Bienvenido de vuelta a
                            <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                RouterAI
                            </span>
                        </h1>

                        <p className="text-gray-400 text-lg leading-relaxed">
                            El router inteligente de modelos de IA que optimiza costo, velocidad y calidad para tus aplicaciones.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">99.9% de tiempo de actividad</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">Enrutamiento multi-proveedor</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">Optimización de costos en tiempo real</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right side - Login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full max-w-md"
                    >
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Iniciar sesión</h2>
                            <p className="text-gray-400">Accede a tu panel de RouterAI</p>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl"
                        >
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
                                    >
                                        {error}
                                        {showEmailVerification && (
                                            <div className="mt-3">
                                                <button
                                                    type="button"
                                                    onClick={handleResendVerification}
                                                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                                                >
                                                    Reenviar email de verificación
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Dirección de email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            name="email"
                                            className={`w-full bg-white/5 border ${focusedField === 'email'
                                                ? 'border-emerald-400/50 ring-2 ring-emerald-400/20'
                                                : 'border-white/10'
                                                } text-white rounded-xl px-4 py-3 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm`}
                                            placeholder="tu@empresa.com"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            name="password"
                                            className={`w-full bg-white/5 border ${focusedField === 'password'
                                                ? 'border-emerald-400/50 ring-2 ring-emerald-400/20'
                                                : 'border-white/10'
                                                } text-white rounded-xl px-4 py-3 pr-12 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm`}
                                            placeholder="Ingresa tu contraseña"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-emerald-500 bg-white/10 border-white/20 rounded focus:ring-emerald-400 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-300">Recordarme</span>
                                    </label>
                                    <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    type="submit"
                                    disabled={isSubmitting || authLoading}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center justify-center">
                                        {(isSubmitting || authLoading) ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                {authLoading ? 'Cargando usuario...' : 'Iniciando sesión...'}
                                            </>
                                        ) : (
                                            <>
                                                Iniciar sesión
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </motion.button>
                            </form>

                            <motion.div variants={itemVariants} className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-black text-gray-400">O continúa con</span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleSocialLogin('github')}
                                        disabled={socialLoading !== null || isSubmitting || authLoading}
                                        className="w-full bg-white/5 border border-white/10 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {socialLoading === 'github' ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <Github className="h-5 w-5" />
                                        )}
                                        <span>GitHub</span>
                                    </button>
                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        disabled={socialLoading !== null || isSubmitting || authLoading}
                                        className="w-full bg-white/5 border border-white/10 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {socialLoading === 'google' ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <Chrome className="h-5 w-5" />
                                        )}
                                        <span>Google</span>
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="mt-6 text-center">
                                <p className="text-gray-400">
                                    ¿No tienes cuenta?{' '}
                                    <a href="/register" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                                        Regístrate ahora
                                    </a>
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}