import { supabase } from '@/config/database';

export interface UserPreferences {
    notifications: {
        browser: boolean;
        email: boolean;
        marketing: boolean;
        security: boolean;
        usage_alerts: boolean;
        cost_alerts: boolean;
    };
    interface: {
        theme: 'light' | 'dark' | 'system';
        auto_save: boolean;
        language: string;
        timezone: string;
    };
    email_settings: {
        weekly_reports: boolean;
        monthly_billing: boolean;
        feature_updates: boolean;
        promotional: boolean;
    };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    notifications: {
        browser: false,
        email: true,
        marketing: false,
        security: true,
        usage_alerts: true,
        cost_alerts: true,
    },
    interface: {
        theme: 'system',
        auto_save: true,
        language: 'es',
        timezone: 'Europe/Madrid',
    },
    email_settings: {
        weekly_reports: true,
        monthly_billing: true,
        feature_updates: true,
        promotional: false,
    },
};

export class UserPreferencesService {
    private static instance: UserPreferencesService;
    private cache: Map<string, UserPreferences> = new Map();

    private constructor() {}

    public static getInstance(): UserPreferencesService {
        if (!UserPreferencesService.instance) {
            UserPreferencesService.instance = new UserPreferencesService();
        }
        return UserPreferencesService.instance;
    }

    public async getPreferences(userId: string): Promise<UserPreferences> {
        // Verificar cache primero
        if (this.cache.has(userId)) {
            return this.cache.get(userId)!;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('preferences')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error loading user preferences:', error);
                return DEFAULT_PREFERENCES;
            }

            const preferences = data?.preferences || {};
            const mergedPreferences = this.mergeWithDefaults(preferences);
            
            // Guardar en cache
            this.cache.set(userId, mergedPreferences);
            
            return mergedPreferences;
        } catch (error) {
            console.error('Error in getPreferences:', error);
            return DEFAULT_PREFERENCES;
        }
    }

    public async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
        try {
            // Obtener preferencias actuales
            const currentPreferences = await this.getPreferences(userId);
            
            // Fusionar con las nuevas preferencias
            const updatedPreferences = this.deepMerge(currentPreferences, preferences);

            const { error } = await supabase
                .from('users')
                .update({ preferences: updatedPreferences })
                .eq('id', userId);

            if (error) {
                console.error('Error updating preferences:', error);
                return false;
            }

            // Actualizar cache
            this.cache.set(userId, updatedPreferences);
            
            return true;
        } catch (error) {
            console.error('Error in updatePreferences:', error);
            return false;
        }
    }

    public async updateNotificationPreference(
        userId: string, 
        type: keyof UserPreferences['notifications'], 
        enabled: boolean
    ): Promise<boolean> {
        const preferences = await this.getPreferences(userId);
        
        return this.updatePreferences(userId, {
            notifications: {
                ...preferences.notifications,
                [type]: enabled
            }
        });
    }

    public async updateInterfacePreference(
        userId: string, 
        setting: keyof UserPreferences['interface'], 
        value: any
    ): Promise<boolean> {
        const preferences = await this.getPreferences(userId);
        
        return this.updatePreferences(userId, {
            interface: {
                ...preferences.interface,
                [setting]: value
            }
        });
    }

    public async updateEmailPreference(
        userId: string, 
        type: keyof UserPreferences['email_settings'], 
        enabled: boolean
    ): Promise<boolean> {
        const preferences = await this.getPreferences(userId);
        
        return this.updatePreferences(userId, {
            email_settings: {
                ...preferences.email_settings,
                [type]: enabled
            }
        });
    }

    private mergeWithDefaults(preferences: any): UserPreferences {
        return this.deepMerge(DEFAULT_PREFERENCES, preferences);
    }

    private deepMerge(target: any, source: any): any {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    public clearCache(userId?: string): void {
        if (userId) {
            this.cache.delete(userId);
        } else {
            this.cache.clear();
        }
    }
}

// Hook para usar el servicio de preferencias
export const useUserPreferences = (userId?: string) => {
    const service = UserPreferencesService.getInstance();

    return {
        getPreferences: (id: string = userId!) => service.getPreferences(id),
        updatePreferences: (preferences: Partial<UserPreferences>, id: string = userId!) => 
            service.updatePreferences(id, preferences),
        updateNotificationPreference: (type: keyof UserPreferences['notifications'], enabled: boolean, id: string = userId!) =>
            service.updateNotificationPreference(id, type, enabled),
        updateInterfacePreference: (setting: keyof UserPreferences['interface'], value: any, id: string = userId!) =>
            service.updateInterfacePreference(id, setting, value),
        updateEmailPreference: (type: keyof UserPreferences['email_settings'], enabled: boolean, id: string = userId!) =>
            service.updateEmailPreference(id, type, enabled),
        clearCache: (id?: string) => service.clearCache(id)
    };
};
