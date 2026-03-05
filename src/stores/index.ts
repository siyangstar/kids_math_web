import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SessionConfig,
  Problem,
  Answer,
  SessionResult,
  WrongNote,
  UserProgress,
  QuizState,
  DEFAULT_CONFIG,
  Badge,
} from '../types';
import { generateProblems, calculateScore } from '../core/math/generator';
import * as storage from '../utils/storage';

interface QuizStore {
  config: SessionConfig;
  setConfig: (config: SessionConfig) => void;
  quizState: QuizState;
  problems: Problem[];
  currentIndex: number;
  answers: Answer[];
  startTime: number;
  currentAnswer: string;
  startQuiz: () => void;
  setCurrentAnswer: (answer: string) => void;
  submitAnswer: () => void;
  nextProblem: () => void;
  finishQuiz: () => SessionResult;
  resetQuiz: () => void;
  currentProblem: () => Problem | null;
  progress: () => { current: number; total: number };
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      quizState: 'idle',
      problems: [],
      currentIndex: 0,
      answers: [],
      startTime: 0,
      currentAnswer: '',
      
      setConfig: (config) => set({ config }),
      
      startQuiz: () => {
        const { config } = get();
        const problems = generateProblems(config);
        set({
          quizState: 'playing',
          problems,
          currentIndex: 0,
          answers: [],
          startTime: Date.now(),
          currentAnswer: '',
        });
      },
      
      setCurrentAnswer: (answer) => set({ currentAnswer: answer }),
      
      submitAnswer: () => {
        const { problems, currentIndex, answers, startTime, currentAnswer } = get();
        const problem = problems[currentIndex];
        const userAnswer = parseInt(currentAnswer, 10);
        const isCorrect = !isNaN(userAnswer) && userAnswer === problem.answer;
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        const answer: Answer = {
          problemId: problem.id,
          userAnswer: isNaN(userAnswer) ? -1 : userAnswer,
          isCorrect,
          timeSpent,
        };
        
        if (!isCorrect) {
          const wrongNote: WrongNote = {
            id: `wrong_${problem.id}`,
            problem,
            userAnswer: isNaN(userAnswer) ? -1 : userAnswer,
            wrongCount: 1,
            lastWrongDate: new Date().toISOString(),
            mastered: false,
            wrongHistory: [{ answer: isNaN(userAnswer) ? -1 : userAnswer, date: new Date().toISOString() }],
          };
          storage.addWrongNote(wrongNote);
        }
        
        set({
          answers: [...answers, answer],
          quizState: 'feedback',
        });
      },
      
      nextProblem: () => {
        const { currentIndex, problems } = get();
        if (currentIndex < problems.length - 1) {
          set({
            currentIndex: currentIndex + 1,
            quizState: 'playing',
            currentAnswer: '',
            startTime: Date.now(),
          });
        } else {
          get().finishQuiz();
        }
      },
      
      finishQuiz: () => {
        const { problems, answers, config, startTime } = get();
        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        const score = calculateScore(correctCount, totalTime, problems.length);
        
        const result: SessionResult = {
          id: `session_${Date.now()}`,
          date: new Date().toISOString(),
          config,
          problems,
          answers,
          correctCount,
          totalTime,
          score,
        };
        
        storage.addSessionResult(result);
        updateProgress(result);
        set({ quizState: 'finished' });
        
        return result;
      },
      
      resetQuiz: () => {
        set({
          quizState: 'idle',
          problems: [],
          currentIndex: 0,
          answers: [],
          currentAnswer: '',
        });
      },
      
      currentProblem: () => {
        const { problems, currentIndex } = get();
        return problems[currentIndex] || null;
      },
      
      progress: () => {
        const { problems, currentIndex } = get();
        return {
          current: currentIndex + 1,
          total: problems.length,
        };
      },
    }),
    {
      name: 'kids-math-quiz',
      partialize: (state) => ({ config: state.config }),
    }
  )
);

interface ProgressStore {
  progress: UserProgress;
  loadProgress: () => void;
  addPoints: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addBadge: (badge: Badge) => void;
}

function checkAndAwardBadges(progress: UserProgress): Badge[] {
  const newBadges: Badge[] = [];
  const existingTypes = progress.badges.map(b => b.type);
  const now = new Date().toISOString();
  
  if (progress.totalSessions === 1 && !existingTypes.includes('first_session')) {
    newBadges.push({ type: 'first_session', name: '初出茅庐', description: '完成第一次练习', icon: '🎯', earnedAt: now });
  }
  
  if (!existingTypes.includes('perfect_score')) {
    newBadges.push({ type: 'perfect_score', name: '全对达人', description: '获得满分', icon: '⭐', earnedAt: now });
  }
  
  return newBadges;
}

function updateProgress(result: SessionResult): void {
  const progress = storage.getUserProgress();
  const newProgress: UserProgress = {
    ...progress,
    totalSessions: progress.totalSessions + 1,
    totalProblems: progress.totalProblems + result.problems.length,
    correctProblems: progress.correctProblems + result.correctCount,
    totalTime: progress.totalTime + result.totalTime,
    points: progress.points + result.score,
    level: Math.floor((progress.points + result.score) / 500) + 1,
    badges: progress.badges,
  };
  
  const newBadges = checkAndAwardBadges(newProgress);
  if (newBadges.length > 0) {
    newProgress.badges = [...newProgress.badges, ...newBadges];
  }
  
  storage.updateUserProgress(newProgress);
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      progress: {
        totalSessions: 0,
        totalProblems: 0,
        correctProblems: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTime: 0,
        points: 0,
        level: 1,
        badges: [],
      },
      
      loadProgress: () => {
        const progress = storage.getUserProgress();
        set({ progress });
      },
      
      addPoints: (points) => {
        const progress = storage.getUserProgress();
        const newProgress = { ...progress, points: progress.points + points, level: Math.floor((progress.points + points) / 500) + 1 };
        storage.updateUserProgress(newProgress);
        set({ progress: newProgress });
      },
      
      incrementStreak: () => {
        const progress = storage.getUserProgress();
        const newProgress = { ...progress, currentStreak: progress.currentStreak + 1, longestStreak: Math.max(progress.longestStreak, progress.currentStreak + 1) };
        storage.updateUserProgress(newProgress);
        set({ progress: newProgress });
      },
      
      resetStreak: () => {
        const progress = storage.getUserProgress();
        const newProgress = { ...progress, currentStreak: 0 };
        storage.updateUserProgress(newProgress);
        set({ progress: newProgress });
      },
      
      addBadge: (badge) => {
        const progress = storage.getUserProgress();
        const newProgress = { ...progress, badges: [...progress.badges, badge] };
        storage.updateUserProgress(newProgress);
        set({ progress: newProgress });
      },
    }),
    { name: 'kids-math-progress' }
  )
);

interface WrongNoteStore {
  wrongNotes: WrongNote[];
  loadWrongNotes: () => void;
  removeWrongNote: (id: string) => void;
  markAsMastered: (id: string) => void;
  updateWrongNote: (id: string, updates: Partial<WrongNote>) => void;
  clearAllWrongNotes: () => void;
}

export const useWrongNoteStore = create<WrongNoteStore>()(
  persist(
    (set) => ({
      wrongNotes: [],
      
      loadWrongNotes: () => {
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      removeWrongNote: (id) => {
        storage.removeWrongNote(id);
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      markAsMastered: (id) => {
        storage.updateWrongNote(id, { mastered: true });
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      updateWrongNote: (id, updates) => {
        storage.updateWrongNote(id, updates);
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      clearAllWrongNotes: () => {
        storage.clearAllWrongNotes();
        set({ wrongNotes: [] });
      },
    }),
    { name: 'kids-math-wrong-notes' }
  )
);

interface HistoryStore {
  history: SessionResult[];
  loadHistory: () => void;
  clearAllHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      
      loadHistory: () => {
        const history = storage.getSessionHistory();
        set({ history });
      },
      
      clearAllHistory: () => {
        storage.clearAllHistory();
        set({ history: [] });
      },
    }),
    { name: 'kids-math-history' }
  )
);
