import { SessionResult, WrongNote, UserProgress } from '../types';
import { MAX_HISTORY_ITEMS } from '../core/math/generator';

// 本地存储键名常量
const STORAGE_KEYS = {
  SESSION_HISTORY: 'kids_math_history', // 练习历史
  WRONG_NOTES: 'kids_math_wrong_notes', // 错题本
  USER_PROGRESS: 'kids_math_progress', // 用户进度
  VERSION: 'kids_math_version', // 数据版本
} as const;

// 当前数据版本号
const CURRENT_VERSION = '1.0.0';

// 安全地从localStorage获取数据
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
}

// 安全地向localStorage存储数据
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item to localStorage: ${key}`, error);
  }
}

// 安全地从localStorage删除数据
function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error);
  }
}

// 获取练习历史记录
export function getSessionHistory(): SessionResult[] {
  return getItem<SessionResult[]>(STORAGE_KEYS.SESSION_HISTORY, []);
}

// 添加练习记录到历史
export function addSessionResult(result: SessionResult): void {
  const history = getSessionHistory();
  history.unshift(result); // 添加到开头
  const trimmed = history.slice(0, MAX_HISTORY_ITEMS); // 限制数量
  setItem(STORAGE_KEYS.SESSION_HISTORY, trimmed);
}

// 设置练习历史记录
export function setSessionHistory(history: SessionResult[]): void {
  setItem(STORAGE_KEYS.SESSION_HISTORY, history);
}

// 获取错题列表
export function getWrongNotes(): WrongNote[] {
  return getItem<WrongNote[]>(STORAGE_KEYS.WRONG_NOTES, []);
}

// 添加错题记录（智能合并同题）
export function addWrongNote(note: WrongNote): void {
  const notes = getWrongNotes();
  // 查找是否已存在相同的题目
  const existingIndex = notes.findIndex(
    n => n.problem.expression === note.problem.expression && n.problem.answer === note.problem.answer
  );
  
  if (existingIndex !== -1) {
    // 存在则合并更新
    const existing = notes[existingIndex];
    notes[existingIndex] = {
      ...existing,
      userAnswer: note.userAnswer,
      wrongCount: existing.wrongCount + 1, // 错误次数+1
      lastWrongDate: note.lastWrongDate,
      mastered: false, // 重置掌握状态
      wrongHistory: [...existing.wrongHistory, { answer: note.userAnswer, date: note.lastWrongDate }], // 添加到历史
    };
    // 移到开头
    notes.unshift(notes.splice(existingIndex, 1)[0]);
  } else {
    // 不存在则添加新记录
    notes.unshift(note);
  }
  
  setItem(STORAGE_KEYS.WRONG_NOTES, notes);
}

// 更新错题信息
export function updateWrongNote(id: string, updates: Partial<WrongNote>): void {
  const notes = getWrongNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates };
    setItem(STORAGE_KEYS.WRONG_NOTES, notes);
  }
}

// 删除单个错题
export function removeWrongNote(id: string): void {
  const notes = getWrongNotes().filter(n => n.id !== id);
  setItem(STORAGE_KEYS.WRONG_NOTES, notes);
}

// 清空所有错题
export function clearAllWrongNotes(): void {
  removeItem(STORAGE_KEYS.WRONG_NOTES);
}

// 获取用户进度
export function getUserProgress(): UserProgress {
  const defaultProgress: UserProgress = {
    totalSessions: 0,
    totalProblems: 0,
    correctProblems: 0,
    totalTime: 0,
    points: 0,
    level: 1,
  };
  return getItem<UserProgress>(STORAGE_KEYS.USER_PROGRESS, defaultProgress);
}

// 更新用户进度
export function updateUserProgress(progress: Partial<UserProgress>): void {
  const current = getUserProgress();
  setItem(STORAGE_KEYS.USER_PROGRESS, { ...current, ...progress });
}

// 清空所有历史记录
export function clearAllHistory(): void {
  removeItem(STORAGE_KEYS.SESSION_HISTORY);
}

// 清空所有数据
export function clearAllData(): void {
  removeItem(STORAGE_KEYS.SESSION_HISTORY);
  removeItem(STORAGE_KEYS.WRONG_NOTES);
  removeItem(STORAGE_KEYS.USER_PROGRESS);
  removeItem(STORAGE_KEYS.VERSION);
}

// 初始化存储（版本检查）
export function initializeStorage(): void {
  const currentVersion = getItem(STORAGE_KEYS.VERSION, null);
  if (currentVersion !== CURRENT_VERSION) {
    // 版本不匹配，清空所有数据
    clearAllData();
    setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
  }
}