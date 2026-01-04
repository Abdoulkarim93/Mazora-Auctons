
import React from 'react';
import { Logo } from './Logo';

export const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-[9999]">
    <div className="flex flex-col items-center">
      <Logo className="h-24 w-24 animate-pulse" linked={false} />
    </div>
  </div>
);
