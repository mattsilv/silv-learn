import React from 'react';
import { Badge } from '../catalyst/badge';
import { AcademicCapIcon } from '@heroicons/react/20/solid';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <AcademicCapIcon className="size-5 text-zinc-900 dark:text-white" />
      <span className="font-semibold text-zinc-900 dark:text-white">
        learn.silv
      </span>
      <Badge color="lime">Alpha</Badge>
    </div>
  );
}; 