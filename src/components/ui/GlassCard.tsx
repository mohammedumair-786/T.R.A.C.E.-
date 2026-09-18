import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  cornerBrackets?: boolean;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  active = false,
  cornerBrackets = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'relative bg-[#0D1B2A]/70 backdrop-blur-md border transition-all duration-300',
          active
            ? 'border-[#00C2FF]/60 shadow-glow-cyan bg-[#0D1B2A]/85'
            : 'border-[#00C2FF]/20 hover:border-[#00C2FF]/40',
          cornerBrackets && 'corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
