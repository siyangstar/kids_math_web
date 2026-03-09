import React, { useState, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';

// 涟漪效果接口
interface Ripple {
  id: number; // 涟漪唯一标识
  x: number; // 涟漪X坐标
  y: number; // 涟漪Y坐标
}

// 按钮组件属性接口
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient' | 'outline' | 'ghost'; // 按钮变体
  size?: 'sm' | 'md' | 'lg'; // 按钮尺寸
  gradient?: 'primary' | 'secondary' | 'accent' | 'rainbow'; // 渐变样式
  children: React.ReactNode; // 按钮内容
  icon?: React.ReactNode; // 图标
  loading?: boolean; // 是否加载中
}

// 通用按钮组件 - 支持多种样式、尺寸和交互效果
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', // 默认主要样式
  size = 'md', // 默认中等尺寸
  gradient, // 渐变样式
  children, // 按钮内容
  className = '', // 自定义类名
  icon, // 图标
  loading = false, // 加载状态
  onClick, // 点击事件
  disabled, // 禁用状态
  ...props // 其他按钮属性
}) => {
  // 涟漪效果状态
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);
  
  // 基础样式
  const baseStyles = 'font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2';
  
  // 变体样式映射
  const variantStyles: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-600', // 主要按钮
    secondary: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-500', // 次要按钮
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus:ring-emerald-500', // 成功按钮
    warning: 'bg-amber-500 text-gray-900 hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-500', // 警告按钮
    error: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500', // 错误按钮
    outline: 'border-2 border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white active:bg-indigo-700 focus:ring-indigo-600', // 轮廓按钮
    ghost: 'text-gray-600 bg-transparent hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900 focus:ring-gray-300', // 幽灵按钮
    gradient: 'text-white', // 渐变按钮基础样式
  };
  
  // 渐变样式映射
  const gradientStyles: Record<string, string> = {
    primary: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600', // 主要渐变
    secondary: 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500', // 次要渐变
    accent: 'bg-gradient-to-r from-purple-600 via-amber-500 to-indigo-600', // 强调渐变
    rainbow: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500', // 彩虹渐变
  };
  
  // 尺寸样式映射
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]', // 小尺寸
    md: 'px-5 py-3 text-base min-h-[48px]', // 中尺寸
    lg: 'px-8 py-4 text-lg min-h-[56px]', // 大尺寸
  };
  
  // 处理点击事件，添加涟漪效果
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    const button = buttonRef.current;
    if (!button) return;
    
    // 计算点击位置相对于按钮的坐标
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 创建新涟漪
    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y,
    };
    
    // 添加涟漪到状态
    setRipples(prev => [...prev, newRipple]);
    
    // 600ms后移除涟漪
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    // 调用原始点击事件
    onClick?.(e);
  }, [loading, disabled, onClick]);
  
  // 计算按钮样式
  const buttonStyle = variant === 'gradient' && gradient
    ? `${variantStyles.gradient} ${gradientStyles[gradient]}` // 渐变样式
    : variantStyles[variant] || variantStyles.primary; // 普通样式
  
  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${buttonStyle} ${sizeStyles[size]} ${className}`}
      onClick={handleClick}
      disabled={loading || disabled}
      {...props}
    >
      {/* 渲染涟漪效果 */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10, // 涟漪中心对齐点击位置
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {/* 加载状态显示 */}
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>加载中...</span>
        </>
      ) : (
        /* 正常状态显示 */
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};
