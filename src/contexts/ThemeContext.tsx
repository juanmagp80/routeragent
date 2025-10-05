"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
    themes: Array<{ value: Theme; label: string; icon: string }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const isInitialLoad = useRef(true);

    const themes = [
        { value: 'light' as const, label: 'Claro', icon: '☀️' },
        { value: 'dark' as const, label: 'Oscuro', icon: '🌙' },
        { value: 'system' as const, label: 'Sistema', icon: '💻' }
    ];

    useEffect(() => {
        // Cargar tema guardado del localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        console.log('🎨 ThemeContext: Cargando tema del localStorage:', savedTheme);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            console.log('✅ ThemeContext: Aplicando tema guardado:', savedTheme);
            setThemeState(savedTheme);
        } else {
            console.log('⚠️ ThemeContext: No hay tema guardado, usando tema claro por defecto');
            setThemeState('light');
        }
        // Marcar que la carga inicial ha terminado
        isInitialLoad.current = false;
    }, []);

    useEffect(() => {
        const applyTheme = () => {
            let actualTheme: 'light' | 'dark';

            if (theme === 'system') {
                actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                actualTheme = theme;
            }

            setResolvedTheme(actualTheme);

            // Aplicar clase al documento
            const root = document.documentElement;
            if (actualTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }

            // No guardar automáticamente aquí, solo cuando el usuario selecciona explícitamente
        };

        applyTheme();

        // Listener para cambios en la preferencia del sistema
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        console.log('🎯 Usuario cambió tema a:', newTheme);
        setThemeState(newTheme);
        // Guardar explícitamente cuando el usuario cambia el tema
        localStorage.setItem('theme', newTheme);
        console.log('💾 ThemeContext: Tema guardado explícitamente en localStorage:', newTheme);
    };

    const value = {
        theme,
        setTheme,
        resolvedTheme,
        themes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}