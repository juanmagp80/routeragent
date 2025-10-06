import { useCallback, useEffect, useRef } from 'react';
import { useBrowserNotifications } from '@/services/notificationService';

interface AutoSaveOptions {
    onSave: () => Promise<boolean>;
    delay?: number; // milisegundos antes de guardar automáticamente
    showNotifications?: boolean;
    enabled?: boolean;
}

export const useAutoSave = ({
    onSave,
    delay = 2000, // 2 segundos por defecto
    showNotifications = true,
    enabled = true
}: AutoSaveOptions) => {
    const { showSuccess, showError } = useBrowserNotifications();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const savingRef = useRef(false);
    const hasUnsavedChangesRef = useRef(false);

    const performSave = useCallback(async () => {
        if (savingRef.current || !hasUnsavedChangesRef.current) {
            return;
        }

        savingRef.current = true;
        
        try {
            const success = await onSave();
            
            if (success) {
                hasUnsavedChangesRef.current = false;
                if (showNotifications) {
                    showSuccess('Configuración guardada automáticamente');
                }
            } else {
                if (showNotifications) {
                    showError('Error al guardar automáticamente');
                }
            }
        } catch (error) {
            console.error('Error en auto-guardado:', error);
            if (showNotifications) {
                showError('Error al guardar automáticamente');
            }
        } finally {
            savingRef.current = false;
        }
    }, [onSave, showNotifications, showSuccess, showError]);

    const scheduleAutoSave = useCallback(() => {
        if (!enabled) return;

        // Cancelar guardado anterior si existe
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Marcar que hay cambios sin guardar
        hasUnsavedChangesRef.current = true;

        // Programar nuevo guardado
        timeoutRef.current = setTimeout(performSave, delay);
    }, [performSave, delay, enabled]);

    const saveNow = useCallback(async () => {
        // Cancelar auto-guardado programado
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Guardar inmediatamente
        await performSave();
    }, [performSave]);

    const cancelAutoSave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        hasUnsavedChangesRef.current = false;
    }, []);

    // Limpiar timeout al desmontar el componente
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Guardar automáticamente antes de cerrar la ventana/pestaña
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (hasUnsavedChangesRef.current && enabled) {
                // Intentar guardar de forma síncrona (limitado por el navegador)
                event.preventDefault();
                event.returnValue = '¿Estás seguro de que quieres salir? Hay cambios sin guardar.';
                return event.returnValue;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && hasUnsavedChangesRef.current && enabled) {
                // Página se está ocultando, intentar guardar
                performSave();
            }
        };

        if (enabled) {
            window.addEventListener('beforeunload', handleBeforeUnload);
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [enabled, performSave]);

    return {
        scheduleAutoSave,
        saveNow,
        cancelAutoSave,
        isSaving: savingRef.current,
        hasUnsavedChanges: hasUnsavedChangesRef.current
    };
};
