// 数学运算类型
export type Operation = '+' | '-' | '×' | '÷';

// 运算数值范围配置
export interface OperationRange {
  min: number; // 最小值
  max: number; // 最大值
}

// 练习会话配置
export interface SessionConfig {
  addition: OperationRange; // 加法范围
  subtraction: OperationRange; // 减法范围
  multiplication: OperationRange; // 乘法范围
  division: OperationRange; // 除法范围
  questionCount: number; // 题目数量
  enabledOperations: Operation[]; // 启用的运算类型
  allowCarryBorrow: boolean; // 是否允许进位退位
  allowNegative: boolean; // 是否允许负数结果
  allow3DigitMixed: boolean; // 是否允许三位数混合运算
  allowParentheses: boolean; // 是否允许括号
}

// 题目结构
export interface Problem {
  id: string; // 题目唯一标识
  expression: string; // 题目表达式
  answer: number; // 正确答案
  operations: Operation[]; // 涉及的运算类型
}

// 用户答题结构
export interface Answer {
  problemId: string; // 题目ID
  userAnswer: number; // 用户答案
  isCorrect: boolean; // 是否正确
  timeSpent: number; // 用时（秒）
}

// 练习会话结果
export interface SessionResult {
  id: string; // 会话唯一标识
  date: string; // 练习日期
  config: SessionConfig; // 练习配置
  problems: Problem[]; // 所有题目
  answers: Answer[]; // 用户答案
  correctCount: number; // 正确题数
  totalTime: number; // 总用时（秒）
  score: number; // 得分（0-100）
}

// 错题记录结构
export interface WrongNote {
  id: string; // 错题唯一标识
  problem: Problem; // 题目信息
  userAnswer: number; // 最近错误答案
  wrongCount: number; // 错误次数
  lastWrongDate: string; // 最近错误时间
  mastered: boolean; // 是否已掌握
  wrongHistory: Array<{ answer: number; date: string }>; // 错误历史记录
}

// 用户学习进度
export interface UserProgress {
  totalSessions: number; // 总练习次数
  totalProblems: number; // 总答题数
  correctProblems: number; // 正确题数
  totalTime: number; // 总用时
  points: number; // 积分
  level: number; // 等级
}

// 测验状态枚举
export type QuizState = 'idle' | 'playing' | 'feedback' | 'finished';
// idle: 空闲状态
// playing: 正在答题
// feedback: 显示反馈
// finished: 已完成

// 默认练习配置
export const DEFAULT_CONFIG: SessionConfig = {
  addition: { min: 1, max: 20 }, // 加法：1-20
  subtraction: { min: 1, max: 20 }, // 减法：1-20
  multiplication: { min: 1, max: 10 }, // 乘法：1-10
  division: { min: 1, max: 10 }, // 除法：1-10
  questionCount: 10, // 默认10道题
  enabledOperations: ['+'], // 默认只启用加法
  allowCarryBorrow: true, // 允许进位退位
  allowNegative: false, // 不允许负数
  allow3DigitMixed: false, // 不允许三位数混合
  allowParentheses: false, // 不允许括号
};

// 配置验证函数 - 确保配置参数的合理性
export function validateConfig(config: SessionConfig): SessionConfig {
  // 确保至少启用一种运算
  const enabledOperations = config.enabledOperations && config.enabledOperations.length > 0
    ? config.enabledOperations
    : ['+'] as Operation[];
  
  // 确保题目数量有效
  const questionCount = Math.max(1, Math.min(100, config.questionCount));
  
  // 验证并修正各运算的数值范围
  const validateRange = (range: OperationRange): OperationRange => ({
    min: Math.max(0, Math.min(range.min, range.max - 1)),
    max: Math.max(range.min + 1, range.max)
  });
  
  // 确保 allowParentheses 依赖于 allow3DigitMixed
  const allowParentheses = config.allow3DigitMixed ? config.allowParentheses : false;
  
  return {
    ...config,
    addition: validateRange(config.addition),
    subtraction: validateRange(config.subtraction),
    multiplication: validateRange(config.multiplication),
    division: validateRange(config.division),
    questionCount,
    enabledOperations,
    allowParentheses
  };
}
