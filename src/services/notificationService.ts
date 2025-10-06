// Servicio para manejar notificaciones del navegador
export class BrowserNotificationService {
    private static instance: BrowserNotificationService;
    private permission: NotificationPermission = 'default';

    private constructor() {
        this.checkPermission();
    }

    public static getInstance(): BrowserNotificationService {
        if (!BrowserNotificationService.instance) {
            BrowserNotificationService.instance = new BrowserNotificationService();
        }
        return BrowserNotificationService.instance;
    }

    private checkPermission(): void {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    public async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Este navegador no soporta notificaciones');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        
        return permission === 'granted';
    }

    public getPermission(): NotificationPermission {
        return this.permission;
    }

    public isSupported(): boolean {
        return 'Notification' in window;
    }

    public showNotification(title: string, options?: NotificationOptions): Notification | null {
        if (this.permission !== 'granted') {
            console.warn('Permisos de notificación no concedidos');
            return null;
        }

        const defaultOptions: NotificationOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'agentrouter-notification',
            requireInteraction: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            
            // Auto-cerrar la notificación después de 5 segundos si no requiere interacción
            if (!defaultOptions.requireInteraction) {
                setTimeout(() => {
                    notification.close();
                }, 5000);
            }

            return notification;
        } catch (error) {
            console.error('Error al mostrar notificación:', error);
            return null;
        }
    }

    public showSuccessNotification(message: string): void {
        this.showNotification('✅ Éxito', {
            body: message,
            icon: '/favicon.ico'
        });
    }

    public showErrorNotification(message: string): void {
        this.showNotification('❌ Error', {
            body: message,
            icon: '/favicon.ico',
            requireInteraction: true
        });
    }

    public showInfoNotification(message: string): void {
        this.showNotification('ℹ️ Información', {
            body: message,
            icon: '/favicon.ico'
        });
    }

    public showWarningNotification(message: string): void {
        this.showNotification('⚠️ Advertencia', {
            body: message,
            icon: '/favicon.ico',
            requireInteraction: true
        });
    }
}

// Hook para usar el servicio de notificaciones del navegador
export const useBrowserNotifications = () => {
    const service = BrowserNotificationService.getInstance();

    return {
        isSupported: service.isSupported(),
        permission: service.getPermission(),
        requestPermission: () => service.requestPermission(),
        showNotification: (title: string, options?: NotificationOptions) => 
            service.showNotification(title, options),
        showSuccess: (message: string) => service.showSuccessNotification(message),
        showError: (message: string) => service.showErrorNotification(message),
        showInfo: (message: string) => service.showInfoNotification(message),
        showWarning: (message: string) => service.showWarningNotification(message)
    };
};
