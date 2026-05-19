import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="w-full min-h-[400px] flex flex-col justify-center items-center gap-4 bg-white text-black font-sans">
    <RefreshCw size={32} strokeWidth={0.8} className="animate-spin" />
    <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
  </div>
);

export default LoadingSpinner;
