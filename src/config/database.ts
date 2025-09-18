import { createClient } from '@supabase/supabase-js';

// Configuración de conexión a Supabase para el frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exponer para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).supabase = supabase;
  console.log('🔧 Supabase client expuesto en window.supabase para debugging');
}

// Tipos para la base de datos
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          company?: string;
          plan: string;
          api_key_limit: number;
          is_active: boolean;
          email_verified: boolean;
          email_verification_token?: string;
          email_verification_expires?: string;
          password_reset_token?: string;
          password_reset_expires?: string;
          two_factor_enabled: boolean;
          two_factor_secret?: string;
          subscription_id?: string;
          subscription_status?: string;
          subscription_current_period_end?: string;
          last_login?: string;
          login_attempts: number;
          locked_until?: string;
          preferences: any;
          profile_data: any;
          social_profiles: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          company?: string;
          plan?: string;
          api_key_limit?: number;
          is_active?: boolean;
          email_verified?: boolean;
          email_verification_token?: string;
          email_verification_expires?: string;
          password_reset_token?: string;
          password_reset_expires?: string;
          two_factor_enabled?: boolean;
          two_factor_secret?: string;
          subscription_id?: string;
          subscription_status?: string;
          subscription_current_period_end?: string;
          last_login?: string;
          login_attempts?: number;
          locked_until?: string;
          preferences?: any;
          profile_data?: any;
          social_profiles?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string;
          company?: string;
          plan?: string;
          api_key_limit?: number;
          is_active?: boolean;
          email_verified?: boolean;
          email_verification_token?: string;
          email_verification_expires?: string;
          password_reset_token?: string;
          password_reset_expires?: string;
          two_factor_enabled?: boolean;
          two_factor_secret?: string;
          subscription_id?: string;
          subscription_status?: string;
          subscription_current_period_end?: string;
          last_login?: string;
          login_attempts?: number;
          locked_until?: string;
          preferences?: any;
          profile_data?: any;
          social_profiles?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
