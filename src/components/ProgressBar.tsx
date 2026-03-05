import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-2 text-sm font-medium">
          <span className="text-gray-600">进度</span>
          <span className="text-gray-900 font-semibold">
            {current} / {total}
          </span>
        </div>
      )}
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// XP Progress bar for levels
interface XpProgressProps {
  currentXp: number;
  level: number;
}

export const XpProgress: React.FC<XpProgressProps> = ({ 
  currentXp, 
  level,
}) => {
  const xpForCurrentLevel = currentXp % 500;
  const percentage = (xpForCurrentLevel / 500) * 100;
  
  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between mb-3 items-center">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-lg">
            Lv.{level}
          </span>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {currentXp} XP
            </div>
            <div className="text-xs text-gray-600">
              距离下一级还需 {500 - xpForCurrentLevel} XP
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular progress for achievements
interface CircularProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
  showLabel?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 'md',
  color = 'primary',
  showLabel = true,
}) => {
  const sizeMap = {
    sm: 60,
    md: 80,
    lg: 100,
  };
  
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const radius = (sizeMap[size] - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const colorMap = {
    primary: '#6366F1',
    secondary: '#F59E0B',
    accent: '#A855F7',
  };
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={sizeMap[size]}
        height={sizeMap[size]}
        className="transform -rotate-90"
      >
        <circle
          cx={sizeMap[size] / 2}
          cy={sizeMap[size] / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={sizeMap[size] / 2}
          cy={sizeMap[size] / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-bold text-gray-900">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};
