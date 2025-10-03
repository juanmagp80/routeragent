"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check, X, Github, Chrome } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const { register, loading: authLoading, isHydrated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Dynamic background animation
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

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const { strength: passwordStrength, checks: passwordChecks } = getPasswordStrength(formData.password);

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
    setSuccess(null);
    setIsSubmitting(true);
    
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      await register(formData.name, formData.email, formData.password);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      setError('Error al crear la cuenta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
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
              Únete al futuro del
              <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                enrutamiento de IA
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Comienza a optimizar tus cargas de trabajo de IA con enrutamiento inteligente de modelos. Únete a miles de desarrolladores que ya usan RouterAI.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-300">Plan gratuito disponible</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-300">Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-300">Seguridad de nivel empresarial</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Registration form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Crear cuenta</h2>
              <p className="text-gray-400">Comienza con RouterAI hoy</p>
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
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    name="name"
                    className={`w-full bg-white/5 border ${
                      focusedField === 'name' 
                        ? 'border-emerald-400/50 ring-2 ring-emerald-400/20' 
                        : 'border-white/10'
                    } text-white rounded-xl px-4 py-3 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm`}
                    placeholder="Juan Pérez"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dirección de email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    name="email"
                    className={`w-full bg-white/5 border ${
                      focusedField === 'email' 
                        ? 'border-emerald-400/50 ring-2 ring-emerald-400/20' 
                        : 'border-white/10'
                    } text-white rounded-xl px-4 py-3 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm`}
                    placeholder="tu@empresa.com"
                  />
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
                      className={`w-full bg-white/5 border ${
                        focusedField === 'password' 
                          ? 'border-emerald-400/50 ring-2 ring-emerald-400/20' 
                          : 'border-white/10'
                      } text-white rounded-xl px-4 py-3 pr-12 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm`}
                      placeholder="Crea una contraseña segura"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-2"
                    >
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength
                                ? passwordStrength <= 2 ? 'bg-red-400' 
                                  : passwordStrength <= 3 ? 'bg-yellow-400'
                                  : 'bg-emerald-400'
                                : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs space-y-1">
                        {Object.entries(passwordChecks).map(([key, passed]) => (
                          <div key={key} className={`flex items-center space-x-2 ${passed ? 'text-emerald-400' : 'text-gray-400'}`}>
                            {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>
                              {key === 'length' && '8+ caracteres'}
                              {key === 'lowercase' && 'Letra minúscula'}
                              {key === 'uppercase' && 'Letra mayúscula'}
                              {key === 'numbers' && 'Número'}
                              {key === 'symbols' && 'Carácter especial'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      name="confirmPassword"
                      className={`w-full bg-white/5 border ${
                        focusedField === 'confirmPassword' 
                          ? 'border-emerald-400/50 ring-2 ring-emerald-400/20' 
                          : formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-400/50'
                            : 'border-white/10'
                      } text-white rounded-xl px-4 py-3 pr-12 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm`}
                      placeholder="Confirma tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">Las contraseñas no coinciden</p>
                  )}
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isSubmitting || passwordStrength < 3}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Crear cuenta
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
                    <span className="px-4 bg-black text-gray-400">O regístrate con</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full bg-white/5 border border-white/10 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm">
                    <Github className="h-5 w-5" />
                    <span>GitHub</span>
                  </button>
                  <button className="w-full bg-white/5 border border-white/10 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm">
                    <Chrome className="h-5 w-5" />
                    <span>Google</span>
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Al crear una cuenta, aceptas nuestros{' '}
                  <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">Términos</a>
                  {' '}y{' '}
                  <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">Política de Privacidad</a>
                </p>
                <p className="text-gray-400 mt-4">
                  ¿Ya tienes cuenta?{' '}
                  <a href="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                    Inicia sesión ahora
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
