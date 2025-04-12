import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useThemeSwitcher() {
  const [theme, setThemeState] = useState<Theme>('system');

  const applyTheme = useCallback((selectedTheme: Theme) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let applyDark = false;

    if (selectedTheme === 'dark') {
      applyDark = true;
    } else if (selectedTheme === 'light') {
      applyDark = false;
    } else { // system
      applyDark = prefersDark;
    }

    const root = window.document.documentElement;
    root.classList.toggle('dark', applyDark);
  }, []);

  // Effect to load saved theme and apply it on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'system';
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  // Effect to listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }
    applyTheme(newTheme);
  };

  return { theme, setTheme };
} 