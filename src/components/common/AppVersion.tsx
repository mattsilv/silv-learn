import React from 'react';

const AppVersion: React.FC = () => {
  const version = import.meta.env.VITE_APP_VERSION || '?.?.?';

  return (
    <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">
      Version: {version}
    </div>
  );
};

export default AppVersion; 