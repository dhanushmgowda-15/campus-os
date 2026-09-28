import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user, updateSettings } = useAuth();
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('campus_os_theme') || 'light';
  });

  // Synchronize with user preferences if available
  useEffect(() => {
    if (user?.settings?.theme) {
      setTheme(user.settings.theme);
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('campus_os_theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (user) {
      try {
        await updateSettings({ theme: nextTheme });
      } catch (err) {
        console.warn('Could not persist theme to server:', err);
      }
    }
  };

  const setThemeExplicitly = async (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;
    setTheme(newTheme);
    if (user) {
      try {
        await updateSettings({ theme: newTheme });
      } catch (err) {
        console.warn('Could not persist theme to server:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeExplicitly, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
