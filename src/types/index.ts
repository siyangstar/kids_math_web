// Operation types
export type Operation = '+' | '-' | '×' | '÷';

// Range configuration for each operation
export interface OperationRange {
  min: number;
  max: number;
}

// Session configuration
export interface SessionConfig {
  addition: OperationRange;
  subtraction: OperationRange;
  multiplication: OperationRange;
  division: OperationRange;
  questionCount: number;
  allow3DigitMixed: boolean;
  allowParentheses: boolean;
  allowCarryBorrow: boolean;
  allowNegative: boolean;
  enabledOperations: Operation[];
}

// Problem types
export interface Problem {
  id: string;
  expression: string;
  answer: number;
  operations: Operation[];
}

// Answer record
export interface Answer {
  problemId: string;
  userAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

// Session result
export interface SessionResult {
  id: string;
  date: string;
  config: SessionConfig;
  problems: Problem[];
  answers: Answer[];
  correctCount: number;
  totalTime: number;
  score: number;
}

// Wrong note item
export interface WrongNote {
  id: string;
  problem: Problem;
  userAnswer: number;
  wrongCount: number;
  lastWrongDate: string;
  mastered: boolean;
  wrongHistory: Array<{ answer: number; date: string }>;
}

// Gamification types
export interface UserProgress {
  totalSessions: number;
  totalProblems: number;
  correctProblems: number;
  currentStreak: number;
  longestStreak: number;
  totalTime: number;
  points: number;
  level: number;
  badges: Badge[];
}

// Badge types
export type BadgeType = 
  | 'first_session'
  | 'perfect_score'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'problems_100'
  | 'problems_500'
  | 'problems_1000'
  | 'speed_demon'
  | 'no_mistakes';

export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

// Quiz state
export type QuizState = 'idle' | 'playing' | 'feedback' | 'finished';

// Default configuration
export const DEFAULT_CONFIG: SessionConfig = {
  addition: { min: 1, max: 20 },
  subtraction: { min: 1, max: 20 },
  multiplication: { min: 1, max: 10 },
  division: { min: 1, max: 10 },
  questionCount: 10,
  allow3DigitMixed: false,
  allowParentheses: false,
  allowCarryBorrow: true,
  allowNegative: false,
  enabledOperations: ['+'],
};

// Validate and fix configuration
export function validateConfig(config: SessionConfig): SessionConfig {
  // Ensure enabledOperations is not empty
  const enabledOperations = config.enabledOperations && config.enabledOperations.length > 0
    ? config.enabledOperations
    : ['+'] as Operation[];
  
  // Ensure min < max for all ranges
  const validateRange = (range: OperationRange): OperationRange => ({
    min: Math.max(0, Math.min(range.min, range.max - 1)),
    max: Math.max(range.min + 1, range.max)
  });
  
  // Ensure allowParentheses depends on allow3DigitMixed
  const allowParentheses = config.allow3DigitMixed ? config.allowParentheses : false;
  
  // Ensure questionCount is reasonable
  const questionCount = Math.max(1, Math.min(100, config.questionCount));
  
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
