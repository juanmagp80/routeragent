// Hook personalizado para autenticación con validaciones adicionales

import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export interface UseAuthHelpers {
  // Estados derivados
  isLoggedIn: boolean;
  isLoading: boolean;
  userPlan: string;
  userName: string;
  userEmail: string;
  
  // Funciones de utilidad
  loginWithValidation: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithValidation: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Validadores
  validateEmail: (email: string) => boolean;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  validatePasswordMatch: (password: string, confirmPassword: string) => boolean;
}

export function useAuthHelpers(): UseAuthHelpers {
  const { user, login, register, logout, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados derivados
  const isLoggedIn = !!user;
  const isLoading = loading || isSubmitting;
  const userPlan = user?.plan || 'starter';
  const userName = user?.name || '';
  const userEmail = user?.email || '';

  // Validador de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validador de contraseña
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Validador de coincidencia de contraseñas
  const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword && password.length > 0;
  };

  // Login con validación
  const loginWithValidation = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsSubmitting(true);

      // Validaciones
      if (!email || !password) {
        return { success: false, error: 'El email y la contraseña son requeridos' };
      }

      if (!validateEmail(email)) {
        return { success: false, error: 'Por favor, ingresa un email válido' };
      }

      await login(email, password);
      return { success: true };

    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registro con validación
  const registerWithValidation = async (
    name: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsSubmitting(true);

      // Validaciones básicas
      if (!name || !email || !password || !confirmPassword) {
        return { success: false, error: 'Todos los campos son requeridos' };
      }

      if (name.length < 2) {
        return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
      }

      if (!validateEmail(email)) {
        return { success: false, error: 'Por favor, ingresa un email válido' };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: passwordValidation.errors[0] // Mostrar el primer error
        };
      }

      if (!validatePasswordMatch(password, confirmPassword)) {
        return { success: false, error: 'Las contraseñas no coinciden' };
      }

      await register(name, email, password);
      return { success: true };

    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Error al crear la cuenta' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Estados derivados
    isLoggedIn,
    isLoading,
    userPlan,
    userName,
    userEmail,
    
    // Funciones de utilidad
    loginWithValidation,
    registerWithValidation,
    
    // Validadores
    validateEmail,
    validatePassword,
    validatePasswordMatch,
  };
}
