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
  validateConfig,
} from '../types';
import { generateProblems, calculateScore, LEVEL_POINTS_DIVISOR } from '../core/math/generator';
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
      
      setConfig: (config) => set({ config: validateConfig(config) }),
      
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
        const { problems, currentIndex, answers, currentAnswer } = get();
        const problem = problems[currentIndex];
        const userAnswer = parseInt(currentAnswer, 10);
        const isCorrect = !isNaN(userAnswer) && userAnswer === problem.answer;
        
        const answer: Answer = {
          problemId: problem.id,
          userAnswer: isNaN(userAnswer) ? -1 : userAnswer,
          isCorrect,
          timeSpent: 0,
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
          });
        } else {
          get().finishQuiz();
        }
      },
      
      finishQuiz: () => {
        const { problems, answers, config, startTime } = get();
        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        const score = calculateScore(correctCount, problems.length);
        
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
    level: Math.floor((progress.points + result.score) / LEVEL_POINTS_DIVISOR) + 1,
  };
  
  storage.updateUserProgress(newProgress);
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      progress: {
        totalSessions: 0,
        totalProblems: 0,
        correctProblems: 0,
        totalTime: 0,
        points: 0,
        level: 1,
      },
      
      loadProgress: () => {
        const progress = storage.getUserProgress();
        set({ progress });
      },
      
      addPoints: (points) => {
        const progress = storage.getUserProgress();
        const newProgress = { ...progress, points: progress.points + points, level: Math.floor((progress.points + points) / LEVEL_POINTS_DIVISOR) + 1 };
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
  removeWrongNotes: (ids: string[]) => void;
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
      
      removeWrongNotes: (ids) => {
        ids.forEach(id => storage.removeWrongNote(id));
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
  removeHistoryItems: (ids: string[]) => void;
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
      
      removeHistoryItems: (ids) => {
        const history = storage.getSessionHistory().filter(h => !ids.includes(h.id));
        storage.setSessionHistory(history);
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
