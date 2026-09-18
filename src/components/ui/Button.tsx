import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-mono uppercase tracking-wider font-semibold transition-all duration-300 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2.5',
    lg: 'text-base px-7 py-3.5 gap-3',
  };

  const variantStyles = {
    primary: 'bg-[#0D1B2A]/80 border border-[#00C2FF]/40 text-[#7DD3FC] hover:text-white hover:border-[#00C2FF] hover:shadow-glow-cyan hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md',
    secondary: 'bg-[#081426]/70 border border-slate-700 text-slate-300 hover:text-white hover:border-[#2563EB] hover:shadow-glow-blue backdrop-blur-md',
    danger: 'bg-[#0D1B2A]/80 border border-[#FF3B4E]/50 text-[#FF3B4E] hover:text-white hover:bg-[#FF3B4E]/20 hover:border-[#FF3B4E] hover:shadow-[0_0_20px_rgba(255,59,78,0.3)]',
    ghost: 'bg-transparent text-slate-400 hover:text-[#00C2FF] hover:bg-[#00C2FF]/5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {/* Corner Bracket Accents on Primary */}
      {variant === 'primary' && (
        <>
          <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#00C2FF] opacity-70 group-hover:opacity-100" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#00C2FF] opacity-70 group-hover:opacity-100" />
          <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#00C2FF] opacity-70 group-hover:opacity-100" />
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#00C2FF] opacity-70 group-hover:opacity-100" />
        </>
      )}

      {/* Subtle shine sweep */}
      <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />

      {icon && <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
