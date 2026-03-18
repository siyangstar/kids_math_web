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

// 测验状态管理接口
interface QuizStore {
  config: SessionConfig; // 测验配置
  setConfig: (config: SessionConfig) => void; // 设置配置
  quizState: QuizState; // 测验状态
  problems: Problem[]; // 题目列表
  currentIndex: number; // 当前题目索引
  answers: Answer[]; // 答案列表
  startTime: number; // 开始时间
  currentAnswer: string; // 当前输入的答案
  startQuiz: () => void; // 开始测验
  setCurrentAnswer: (answer: string) => void; // 设置当前答案
  submitAnswer: () => void; // 提交答案
  nextProblem: () => void; // 下一题
  finishQuiz: () => SessionResult; // 完成测验
  resetQuiz: () => void; // 重置测验
  currentProblem: () => Problem | null; // 获取当前题目
  progress: () => { current: number; total: number }; // 获取进度
}

// 测验状态管理Store
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
      
      // 设置测验配置（自动验证）
      setConfig: (config) => set({ config: validateConfig(config) }),
      
      // 开始测验
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
      
      // 设置当前答案
      setCurrentAnswer: (answer) => set({ currentAnswer: answer }),
      
      // 提交答案
      submitAnswer: () => {
        const { problems, currentIndex, answers, currentAnswer } = get();
        const problem = problems[currentIndex];
        const userAnswer = parseInt(currentAnswer, 10);
        const isCorrect = !isNaN(userAnswer) && userAnswer === problem.answer;
        
        const answer: Answer = {
          problemId: problem.id,
          userAnswer: isNaN(userAnswer) ? -1 : userAnswer,
          isCorrect,
          timeSpent: 0, // 单题时间不再记录
        };
        
        // 如果答错，添加到错题本
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
      
      // 下一题
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
      
      // 完成测验
      finishQuiz: () => {
        const { problems, answers, config, startTime } = get();
        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalTime = Math.round((Date.now() - startTime) / 1000); // 计算总用时
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
        
        recordSessionResult(result);
        set({ quizState: 'finished' });
        
        return result;
      },
      
      // 重置测验
      resetQuiz: () => {
        set({
          quizState: 'idle',
          problems: [],
          currentIndex: 0,
          answers: [],
          currentAnswer: '',
        });
      },
      
      // 获取当前题目
      currentProblem: () => {
        const { problems, currentIndex } = get();
        return problems[currentIndex] || null;
      },
      
      // 获取进度
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
      partialize: (state) => ({ config: state.config }), // 只持久化配置
    }
  )
);

// 学习进度管理接口
interface ProgressStore {
  progress: UserProgress; // 用户进度数据
  loadProgress: () => void; // 加载进度
  addPoints: (points: number) => void; // 添加积分
}

export function recordSessionResult(result: SessionResult): void {
  storage.addSessionResult(result);
  updateProgress(result);
}

// 更新用户学习进度
function updateProgress(result: SessionResult): void {
  const progress = storage.getUserProgress();
  const newProgress: UserProgress = {
    ...progress,
    totalSessions: progress.totalSessions + 1, // 练习次数+1
    totalProblems: progress.totalProblems + result.problems.length, // 总答题数增加
    correctProblems: progress.correctProblems + result.correctCount, // 正确题数增加
    totalTime: progress.totalTime + result.totalTime, // 总用时增加
    points: progress.points + result.score, // 积分增加
    level: Math.floor((progress.points + result.score) / LEVEL_POINTS_DIVISOR) + 1, // 重新计算等级
  };
  
  storage.updateUserProgress(newProgress);
}

// 学习进度状态管理Store
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      // 默认进度数据
      progress: {
        totalSessions: 0,
        totalProblems: 0,
        correctProblems: 0,
        totalTime: 0,
        points: 0,
        level: 1,
      },
      
      // 从存储加载进度
      loadProgress: () => {
        const progress = storage.getUserProgress();
        set({ progress });
      },
      
      // 添加积分并更新等级
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

// 错题本管理接口
interface WrongNoteStore {
  wrongNotes: WrongNote[]; // 错题列表
  loadWrongNotes: () => void; // 加载错题
  removeWrongNote: (id: string) => void; // 删除单个错题
  removeWrongNotes: (ids: string[]) => void; // 批量删除错题
  markAsMastered: (id: string) => void; // 标记为已掌握
  updateWrongNote: (id: string, updates: Partial<WrongNote>) => void; // 更新错题
  clearAllWrongNotes: () => void; // 清空所有错题
}

// 错题本状态管理Store
export const useWrongNoteStore = create<WrongNoteStore>()(
  persist(
    (set) => ({
      wrongNotes: [],
      
      // 从存储加载错题
      loadWrongNotes: () => {
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      // 删除单个错题
      removeWrongNote: (id) => {
        storage.removeWrongNote(id);
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      // 批量删除错题
      removeWrongNotes: (ids) => {
        ids.forEach(id => storage.removeWrongNote(id));
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      // 标记为已掌握
      markAsMastered: (id) => {
        storage.updateWrongNote(id, { mastered: true });
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      // 更新错题信息
      updateWrongNote: (id, updates) => {
        storage.updateWrongNote(id, updates);
        const wrongNotes = storage.getWrongNotes();
        set({ wrongNotes });
      },
      
      // 清空所有错题
      clearAllWrongNotes: () => {
        storage.clearAllWrongNotes();
        set({ wrongNotes: [] });
      },
    }),
    { name: 'kids-math-wrong-notes' }
  )
);

// 历史记录管理接口
interface HistoryStore {
  history: SessionResult[]; // 历史记录列表
  loadHistory: () => void; // 加载历史记录
  removeHistoryItems: (ids: string[]) => void; // 删除指定历史记录
  clearAllHistory: () => void; // 清空所有历史记录
}

// 历史记录状态管理Store
export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      
      // 从存储加载历史记录
      loadHistory: () => {
        const history = storage.getSessionHistory();
        set({ history });
      },
      
      // 删除指定历史记录
      removeHistoryItems: (ids) => {
        const history = storage.getSessionHistory().filter(h => !ids.includes(h.id));
        storage.setSessionHistory(history);
        set({ history });
      },
      
      // 清空所有历史记录
      clearAllHistory: () => {
        storage.clearAllHistory();
        set({ history: [] });
      },
    }),
    { name: 'kids-math-history' }
  )
);
