// Servicio de autenticación frontend usando Supabase Auth

import { supabase } from '../config/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Interfaces para el usuario
export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  plan: string;
  api_key_limit: number;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  company?: string;
  plan?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class FrontendAuthService {
  // Registrar nuevo usuario usando Supabase Auth
  async register(userData: CreateUserInput): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
    error?: string;
  }> {
    try {
      // Validar entrada
      if (!userData.email || !userData.password || !userData.name) {
        return {
          success: false,
          error: "Email, contraseña y nombre son requeridos"
        };
      }

      // Verificar que la contraseña tenga al menos 8 caracteres
      if (userData.password.length < 8) {
        return {
          success: false,
          error: "La contraseña debe tener al menos 8 caracteres"
        };
      }

      // Registrar usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            company: userData.company || '',
            plan: userData.plan || 'free'
          }
        }
      });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        return {
          success: false,
          error: authError.message === 'User already registered' 
            ? "El email ya está en uso" 
            : "Error en el registro: " + authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: "No se pudo crear el usuario"
        };
      }

      // El trigger se encargará automáticamente de crear el registro en users
      // No necesitamos hacer nada más, solo devolver el éxito

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: userData.name,
          company: userData.company || null,
          plan: userData.plan || 'free',
          api_key_limit: 3,
          is_active: true,
          email_verified: authData.user.email_confirmed_at !== null,
          created_at: authData.user.created_at,
          updated_at: authData.user.updated_at || authData.user.created_at
        },
        message: "Usuario registrado exitosamente. Por favor verifica tu email."
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: "Error interno del servidor"
      };
    }
  }
  // Iniciar sesión usando Supabase Auth
  async login(credentials: LoginInput): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
    error?: string;
  }> {
    try {
      // Validar entrada
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: "Email y contraseña son requeridos"
        };
      }

      console.log('Iniciando login con Supabase Auth...');
      
      // Iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      console.log('Respuesta de Supabase Auth:', { authData, authError });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        let errorMessage = "Error en el inicio de sesión";
        
        if (authError.message === 'Invalid login credentials') {
          errorMessage = "Email o contraseña incorrectos";
        } else if (authError.message === 'Email not confirmed') {
          errorMessage = "Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = "Email no verificado. Revisa tu bandeja de entrada para confirmar tu cuenta.";
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      if (!authData.user || !authData.session) {
        console.log('No se recibió usuario o sesión de Supabase');
        return {
          success: false,
          error: "Error en el inicio de sesión"
        };
      }

      console.log('Usuario autenticado en Supabase:', authData.user);

      // Obtener datos del usuario de la tabla users
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('Datos del usuario de la tabla users:', { user, userError });

      if (userError || !user) {
        console.error('Database error:', userError);
        // Si no encontramos el usuario en la tabla users, usar datos de auth
        const fallbackUser = {
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || '',
          company: authData.user.user_metadata?.company || null,
          plan: authData.user.user_metadata?.plan || 'free',
          api_key_limit: 3,
          is_active: true,
          email_verified: authData.user.email_confirmed_at !== null,
          created_at: authData.user.created_at,
          updated_at: authData.user.updated_at || authData.user.created_at
        };
        
        console.log('Usando usuario fallback:', fallbackUser);
        
        return {
          success: true,
          user: fallbackUser,
          token: authData.session.access_token,
          message: "Inicio de sesión exitoso"
        };
      }

      // Verificar si la cuenta está activa
      if (!user.is_active) {
        return {
          success: false,
          error: "La cuenta está desactivada. Contacta soporte."
        };
      }

      // Actualizar último login
      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          plan: user.plan,
          api_key_limit: user.api_key_limit,
          is_active: user.is_active,
          email_verified: user.email_verified,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token: authData.session?.access_token,
        message: "Inicio de sesión exitoso"
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: "Error inesperado durante el inicio de sesión"
      };
    }
  }

  // Obtener usuario actual de la sesión
  async getCurrentUser(): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      // Obtener usuario actual de Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('🔑 Supabase Auth user:', authUser ? authUser.id : null, authUser);

      if (authError || !authUser) {
        console.error('❌ Error en Supabase Auth:', authError);
        return {
          success: false,
          error: "No hay sesión activa"
        };
      }

      // Obtener datos completos del usuario de la tabla users
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      console.log('📦 Resultado consulta tabla users:', { user, userError, idBuscado: authUser.id });

      if (userError || !user) {
        console.error('❌ Database error:', userError);
        return {
          success: false,
          error: "Error obteniendo datos del usuario"
        };
      }

      if (!user.is_active) {
        console.warn('⚠️ Usuario desactivado:', user.id);
        return {
          success: false,
          error: "La cuenta está desactivada"
        };
      }

      console.log('✅ Usuario encontrado y activo:', user.id);
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          plan: user.plan,
          api_key_limit: user.api_key_limit,
          is_active: user.is_active,
          email_verified: user.email_verified,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      };

    } catch (error) {
      console.error('❌ Get current user error:', error);
      return {
        success: false,
        error: "Error obteniendo usuario actual"
      };
    }
  }

  // Cerrar sesión
  async logout(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return {
          success: false,
          error: "Error cerrando sesión"
        };
      }

      return {
        success: true,
        message: "Sesión cerrada exitosamente"
      };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: "Error inesperado cerrando sesión"
      };
    }
  }

  // Verificar si hay una sesión activa
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }

  // Reenviar email de verificación
  async resendVerificationEmail(email: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('Resend verification error:', error);
        return {
          success: false,
          error: "Error reenviando email de verificación"
        };
      }

      return {
        success: true,
        message: "Email de verificación reenviado exitosamente"
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: "Error inesperado reenviando email"
      };
    }
  }
}

// Instancia singleton del servicio
export const frontendAuthService = new FrontendAuthService();
