import React, { useState, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  gradient?: 'primary' | 'secondary' | 'accent' | 'rainbow';
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  gradient,
  children,
  className = '',
  icon,
  loading = false,
  onClick,
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);
  
  const baseStyles = 'font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2';
  
  const variantStyles: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-600',
    secondary: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-500',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus:ring-emerald-500',
    warning: 'bg-amber-500 text-gray-900 hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-500',
    error: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
    outline: 'border-2 border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white active:bg-indigo-700 focus:ring-indigo-600',
    ghost: 'text-gray-600 bg-transparent hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900 focus:ring-gray-300',
    gradient: 'text-white',
  };
  
  const gradientStyles: Record<string, string> = {
    primary: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600',
    secondary: 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500',
    accent: 'bg-gradient-to-r from-purple-600 via-amber-500 to-indigo-600',
    rainbow: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  };
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    const button = buttonRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onClick?.(e);
  }, [loading, disabled, onClick]);
  
  const buttonStyle = variant === 'gradient' && gradient
    ? `${variantStyles.gradient} ${gradientStyles[gradient]}`
    : variantStyles[variant] || variantStyles.primary;
  
  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${buttonStyle} ${sizeStyles[size]} ${className}`}
      onClick={handleClick}
      disabled={loading || disabled}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>加载中...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};
