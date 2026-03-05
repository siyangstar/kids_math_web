import { SessionResult, WrongNote, UserProgress, SessionConfig } from '../types';

const STORAGE_KEYS = {
  SESSION_HISTORY: 'kids_math_history',
  WRONG_NOTES: 'kids_math_wrong_notes',
  USER_PROGRESS: 'kids_math_progress',
  SESSION_CONFIG: 'kids_math_config',
  VERSION: 'kids_math_version',
} as const;

const CURRENT_VERSION = '1.0.0';

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function getSessionHistory(): SessionResult[] {
  return getItem<SessionResult[]>(STORAGE_KEYS.SESSION_HISTORY, []);
}

export function addSessionResult(result: SessionResult): void {
  const history = getSessionHistory();
  history.unshift(result);
  const trimmed = history.slice(0, 100);
  setItem(STORAGE_KEYS.SESSION_HISTORY, trimmed);
}

export function getWrongNotes(): WrongNote[] {
  return getItem<WrongNote[]>(STORAGE_KEYS.WRONG_NOTES, []);
}

export function addWrongNote(note: WrongNote): void {
  const notes = getWrongNotes();
  // Always add as a new entry - don't merge
  // Each wrong answer is a separate entry
  notes.unshift(note);
  setItem(STORAGE_KEYS.WRONG_NOTES, notes);
}

export function updateWrongNote(id: string, updates: Partial<WrongNote>): void {
  const notes = getWrongNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates };
    setItem(STORAGE_KEYS.WRONG_NOTES, notes);
  }
}

export function removeWrongNote(id: string): void {
  const notes = getWrongNotes().filter(n => n.id !== id);
  setItem(STORAGE_KEYS.WRONG_NOTES, notes);
}

export function getUserProgress(): UserProgress {
  const defaultProgress: UserProgress = {
    totalSessions: 0,
    totalProblems: 0,
    correctProblems: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTime: 0,
    points: 0,
    level: 1,
    badges: [],
  };
  return getItem<UserProgress>(STORAGE_KEYS.USER_PROGRESS, defaultProgress);
}

export function updateUserProgress(progress: Partial<UserProgress>): void {
  const current = getUserProgress();
  setItem(STORAGE_KEYS.USER_PROGRESS, { ...current, ...progress });
}

export function getSessionConfig(): SessionConfig {
  const stored = getItem<SessionConfig | null>(STORAGE_KEYS.SESSION_CONFIG, null);
  return stored ?? {
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
}

export function saveSessionConfig(config: SessionConfig): void {
  setItem(STORAGE_KEYS.SESSION_CONFIG, config);
}

export function initializeStorage(): void {
  const version = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (version !== CURRENT_VERSION) {
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Clear all wrong notes
export function clearAllWrongNotes(): void {
  setItem(STORAGE_KEYS.WRONG_NOTES, []);
}

// Clear all history
export function clearAllHistory(): void {
  setItem(STORAGE_KEYS.SESSION_HISTORY, []);
}
