import React from 'react';
import { Button } from './Button';
import { Delete } from 'lucide-react';
import { MAX_INPUT_LENGTH } from '../core/math/generator';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const handleNumber = (num: string) => {
    if (value.length < MAX_INPUT_LENGTH) {
      onChange(value + num);
    }
  };
  
  const handleClear = () => {
    onChange('');
  };
  
  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };
  
  const handleNegative = () => {
    if (value.startsWith('-')) {
      onChange(value.slice(1));
    } else {
      onChange('-' + value);
    }
  };
  
  // Standard calculator layout: 1-9, 0
  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['-', '0', '⌫'],
  ];
  
  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Number pad */}
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((row, rowIndex) => (
          row.map((btn) => (
            <button
              key={`${rowIndex}-${btn}`}
              onClick={() => {
                if (btn === '⌫') {
                  handleBackspace();
                } else if (btn === '-') {
                  handleNegative();
                } else {
                  handleNumber(btn);
                }
              }}
              disabled={disabled}
              className={`h-14 rounded-xl text-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                btn === '⌫' 
                  ? 'bg-gray-200 hover:bg-gray-300 text-[var(--color-text-primary)]'
                  : btn === '-'
                  ? 'bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)]'
                  : 'bg-white border-2 border-gray-200 hover:border-[var(--color-primary)] hover:bg-indigo-50 text-[var(--color-text-primary)]'
              }`}
            >
              {btn === '⌫' ? <Delete className="w-6 h-6 mx-auto" /> : btn}
            </button>
          ))
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleClear}
          disabled={disabled}
          className="flex-1"
        >
          清除
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          disabled={disabled || !value}
          className="flex-1"
        >
          确认
        </Button>
      </div>
    </div>
  );
};