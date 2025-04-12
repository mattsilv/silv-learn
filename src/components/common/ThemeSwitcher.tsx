import React from 'react';
import { useThemeSwitcher } from '../../hooks/useThemeSwitcher';
import { Button } from '../../components/catalyst/button';
import clsx from 'clsx';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useThemeSwitcher();

  return (
    <div className="flex items-center space-x-2 p-4">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Theme:</span>
      <Button 
        plain 
        className={clsx(theme === 'light' && 'bg-gray-100 dark:bg-gray-700')}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        Light
      </Button>
      <Button 
        plain 
        className={clsx(theme === 'dark' && 'bg-gray-100 dark:bg-gray-700')}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        Dark
      </Button>
      <Button 
        plain 
        className={clsx(theme === 'system' && 'bg-gray-100 dark:bg-gray-700')}
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
      >
        System
      </Button>
    </div>
  );
}; 