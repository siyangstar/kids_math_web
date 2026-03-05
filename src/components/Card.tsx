import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  onClick,
}) => {
  const baseStyles = 'bg-white rounded-2xl border border-gray-200 shadow-sm';
  const cursorClass = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  
  return (
    <div
      className={`${baseStyles} ${cursorClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};