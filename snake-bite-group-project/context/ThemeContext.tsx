import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    colors: {
        background: string;
        cardBg: string;
        textPrimary: string;
        textSecondary: string;
        border: string;
        headerBg: string;
        buttonBg: string;
    };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [darkMode, setDarkMode] = useState(false);

    const colors = {
        background: darkMode ? '#0f172a' : '#f8fafc',
        cardBg: darkMode ? '#1e293b' : '#ffffff',
        textPrimary: darkMode ? '#f1f5f9' : '#1e293b',
        textSecondary: darkMode ? '#cbd5e1' : '#475569',
        border: darkMode ? '#334155' : '#e2e8f0',
        headerBg: darkMode ? '#1e293b' : '#ffffff',
        buttonBg: darkMode ? '#334155' : '#2563eb',
    };

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
