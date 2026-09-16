import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('cz_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('cz_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('cz_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setTheme = (dark: boolean) => setIsDark(dark);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        theme: isDark ? 'dark' : 'light',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
