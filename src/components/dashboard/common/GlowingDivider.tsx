import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlowingDividerProps {
  className?: string;
  intensity?: 'subtle' | 'normal' | 'bright';
}

export const GlowingDivider: React.FC<GlowingDividerProps> = ({
  className,
  intensity = 'normal'
}) => {
  const intensityMap = {
    subtle: 'via-[#00C2FF]/20',
    normal: 'via-[#00C2FF]/40',
    bright: 'via-[#00C2FF]/70 shadow-[0_0_8px_rgba(0,194,255,0.4)]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'h-[1px] w-full bg-gradient-to-r from-transparent to-transparent',
          intensityMap[intensity],
          className
        )
      )}
    />
  );
};
