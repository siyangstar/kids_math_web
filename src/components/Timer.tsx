import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ isRunning, onTimeUpdate }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => {
          const newValue = s + 1;
          onTimeUpdate?.(newValue);
          return newValue;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);
  
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
      <TimerIcon className="w-6 h-6 text-[var(--color-primary)]" />
      <span className="text-xl font-bold text-[var(--color-text-primary)] font-mono">
        {formatTime(seconds)}
      </span>
    </div>
  );
};
