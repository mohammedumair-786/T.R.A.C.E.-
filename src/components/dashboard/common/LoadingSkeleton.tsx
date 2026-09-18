import React from 'react';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`p-4 bg-[#0D1B2A]/70 hud-border corner-bracket-tl corner-bracket-br animate-pulse ${className}`}>
      <div className="h-4 bg-[#081426] border border-[#00C2FF]/20 rounded w-1/3 mb-4" />
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-[#081426] border border-slate-800 rounded"
            style={{ width: `${Math.max(40, 95 - i * 15)}%` }}
          />
        ))}
      </div>
    </div>
  );
};
