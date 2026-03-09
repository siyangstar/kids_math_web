import React from 'react';
import { SessionConfig, OperationRange, Operation } from '../types';
import { Button } from './Button';
import { Settings, Plus, Minus, X, Divide } from 'lucide-react';

interface SettingsProps {
  config: SessionConfig;
  onConfigChange: (config: SessionConfig) => void;
  onStart: () => void;
}

// Slider component
interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max }) => (
  <div className="space-y-1 sm:space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-xs sm:text-sm font-medium text-gray-600">{label}</label>
      <span className="text-xs sm:text-sm font-semibold text-indigo-600">{value}</span>
    </div>
    <input type="range" value={value} onChange={(e) => onChange(parseInt(e.target.value))} min={min} max={max}
      className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
  </div>
);

// Toggle component
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled, description }) => (
  <label className={`flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
    <div>
      <span className="text-sm sm:text-base font-medium text-gray-900">{label}</span>
      {description && <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">{description}</p>}
    </div>
    <button onClick={() => !disabled && onChange(!checked)} disabled={disabled}
      className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </label>
);

// Operation row with expand/collapse
interface OperationRowProps {
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  range: OperationRange;
  onToggle: (enabled: boolean) => void;
  onRangeChange: (range: OperationRange) => void;
}

const OperationRow: React.FC<OperationRowProps> = ({ label, icon, enabled, range, onToggle, onRangeChange }) => {
  const [expanded, setExpanded] = React.useState(enabled);
  
  React.useEffect(() => {
    if (enabled && !expanded) setExpanded(true);
  }, [enabled, expanded]);
  
  return (
    <div className={`bg-white rounded-xl transition-all ${enabled ? 'border-2 border-indigo-600 shadow-md' : 'border border-gray-200'}`}>
      {/* Header - clickable to toggle */}
      <div 
        className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer rounded-xl hover:bg-gray-50 transition-colors"
        onClick={() => onToggle(!enabled)}
      >
        {/* Icon */}
        <div className={`p-2 sm:p-3 rounded-xl transition-colors flex-shrink-0 ${enabled ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
          {icon}
        </div>
        
        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className={`font-semibold text-sm sm:text-lg ${enabled ? 'text-gray-900' : 'text-gray-400'}`}>
            {label}
          </span>
        </div>
        
        {/* Toggle indicator */}
        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          enabled ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
        }`}>
          {enabled && <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>}
        </div>
      </div>
      
      {/* Range controls - expandable */}
      {enabled && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-gray-100 mt-0">
          <div className="pt-3 sm:pt-4 grid grid-cols-2 gap-3 sm:gap-4" onClick={(e) => e.stopPropagation()}>
            <Slider label="最小值" value={range.min} onChange={(min) => onRangeChange({ ...range, min })} min={0} max={Math.min(range.max - 1, 99)} />
            <Slider label="最大值" value={range.max} onChange={(max) => onRangeChange({ ...range, max })} min={Math.max(range.min + 1, 1)} max={100} />
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsComponent: React.FC<SettingsProps> = ({ config, onConfigChange, onStart }) => {
  const handleOperationToggle = (operation: Operation, enabled: boolean) => {
    const currentOps = config.enabledOperations || ['+'];
    const newOperations = enabled ? [...currentOps, operation] : currentOps.filter(op => op !== operation);
    if (newOperations.length > 0) onConfigChange({ ...config, enabledOperations: newOperations });
  };

  const isOperationEnabled = (op: Operation) => (config.enabledOperations && config.enabledOperations.includes(op)) ?? false;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-1">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">练习设置</h2>
      </div>
      
      {/* Question count slider */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
        <Slider label="题目数量" value={config.questionCount} onChange={(count) => onConfigChange({ ...config, questionCount: count })} min={1} max={100} />
      </div>
      
      {/* Operations */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">运算类型与范围</h3>
        <div className="space-y-2 sm:space-y-3">
          <OperationRow label="加法" icon={<Plus className="w-4 h-4 sm:w-6 sm:h-6" />} enabled={isOperationEnabled('+')} range={config.addition} onToggle={(e) => handleOperationToggle('+', e)} onRangeChange={(r) => onConfigChange({ ...config, addition: r })} />
          <OperationRow label="减法" icon={<Minus className="w-4 h-4 sm:w-6 sm:h-6" />} enabled={isOperationEnabled('-')} range={config.subtraction} onToggle={(e) => handleOperationToggle('-', e)} onRangeChange={(r) => onConfigChange({ ...config, subtraction: r })} />
          <OperationRow label="乘法" icon={<X className="w-4 h-4 sm:w-6 sm:h-6" />} enabled={isOperationEnabled('×')} range={config.multiplication} onToggle={(e) => handleOperationToggle('×', e)} onRangeChange={(r) => onConfigChange({ ...config, multiplication: r })} />
          <OperationRow label="除法" icon={<Divide className="w-4 h-4 sm:w-6 sm:h-6" />} enabled={isOperationEnabled('÷')} range={config.division} onToggle={(e) => handleOperationToggle('÷', e)} onRangeChange={(r) => onConfigChange({ ...config, division: r })} />
        </div>
      </div>
      
      {/* Advanced options */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">高级选项</h3>
        <Toggle label="允许进位/退位" checked={config.allowCarryBorrow} onChange={(c) => onConfigChange({ ...config, allowCarryBorrow: c })} />
        <Toggle label="允许负数结果" checked={config.allowNegative} onChange={(c) => onConfigChange({ ...config, allowNegative: c })} />
        <Toggle label="3 个数字混合运算" checked={config.allow3DigitMixed} onChange={(c) => onConfigChange({ ...config, allow3DigitMixed: c, allowParentheses: c ? config.allowParentheses : false })} description="使用 3 个数字进行混合运算（如：5 + 3 - 2）" />
        {config.allow3DigitMixed && (
          <div className="ml-3 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-indigo-600">
            <Toggle label="括号运算" checked={config.allowParentheses} onChange={(c) => onConfigChange({ ...config, allowParentheses: c })} description="包含括号的运算表达式" />
          </div>
        )}
      </div>
      
      <Button variant="primary" size="lg" onClick={onStart} className="w-full text-base sm:text-lg py-3 sm:py-4">开始练习</Button>
    </div>
  );
};