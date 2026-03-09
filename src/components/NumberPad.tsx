import React from 'react';
import { Button } from './Button';
import { Delete } from 'lucide-react';
import { MAX_INPUT_LENGTH } from '../core/math/generator';

// 数字键盘组件属性接口
interface NumberPadProps {
  value: string; // 当前输入值
  onChange: (value: string) => void; // 值变化回调
  onSubmit: () => void; // 提交回调
  disabled?: boolean; // 是否禁用
}

// 数字键盘组件 - 提供数字输入和操作按钮
export const NumberPad: React.FC<NumberPadProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  // 处理数字点击
  const handleNumber = (num: string) => {
    if (disabled) return;
    
    // 限制输入长度
    if (value.length < MAX_INPUT_LENGTH) {
      onChange(value + num);
    }
  };
  
  // 清空输入
  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };
  
  // 退格删除
  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };
  
  // 切换负号
  const handleNegative = () => {
    if (disabled) return;
    
    if (value.startsWith('-')) {
      onChange(value.slice(1)); // 移除负号
    } else {
      onChange('-' + value); // 添加负号
    }
  };

  // 标准计算器布局：4行3列
  const buttons = [
    ['1', '2', '3'], // 第一行
    ['4', '5', '6'], // 第二行
    ['7', '8', '9'], // 第三行
    ['-', '0', '⌫'], // 第四行：负号、零、退格
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* 数字键盘网格 */}
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((row, rowIndex) => (
          row.map((btn) => (
            <button
              key={`${rowIndex}-${btn}`}
              onClick={() => {
                if (btn === '⌫') {
                  handleBackspace(); // 退格删除
                } else if (btn === '-') {
                  handleNegative(); // 切换负号
                } else {
                  handleNumber(btn); // 输入数字
                }
              }}
              disabled={disabled}
              className={`h-14 rounded-xl text-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                btn === '⌫' 
                  ? 'bg-gray-200 hover:bg-gray-300 text-[var(--color-text-primary)]' // 退格按钮样式
                  : btn === '-'
                  ? 'bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)]' // 负号按钮样式
                  : 'bg-white border-2 border-gray-200 hover:border-[var(--color-primary)] hover:bg-indigo-50 text-[var(--color-text-primary)]' // 数字按钮样式
              }`}
            >
              {btn === '⌫' ? <Delete className="w-6 h-6 mx-auto" /> : btn}
            </button>
          ))
        ))}
      </div>
      
      {/* 操作按钮区域 */}
      <div className="flex gap-2 mt-4">
        {/* 清除按钮 */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleClear}
          disabled={disabled}
          className="flex-1"
        >
          清除
        </Button>
        {/* 确认提交按钮 */}
        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          disabled={disabled || !value} // 无输入时禁用
          className="flex-1"
        >
          确认
        </Button>
      </div>
    </div>
  );
};