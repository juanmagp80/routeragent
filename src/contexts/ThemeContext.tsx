"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
    themes: Array<{ value: Theme; label: string; icon: string }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    const themes = [
        { value: 'light' as const, label: 'Claro', icon: '☀️' },
        { value: 'dark' as const, label: 'Oscuro', icon: '🌙' },
        { value: 'system' as const, label: 'Sistema', icon: '💻' }
    ];

    useEffect(() => {
        // Cargar tema guardado del localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
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

            // Guardar en localStorage
            localStorage.setItem('theme', theme);
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
        setThemeState(newTheme);
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