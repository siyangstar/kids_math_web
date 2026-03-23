import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Target, Settings, History, FileText, Star, Trophy, Zap, Flame, CalendarDays } from 'lucide-react';
import { Button } from '../components/Button';
import { useProgressStore, useQuizStore, useWrongNoteStore } from '../stores';
import { LEVEL_POINTS_DIVISOR } from '../core/math/generator';
import { getTodayProblems } from '../utils/storage';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { progress, loadProgress } = useProgressStore();
  const { config, startQuiz } = useQuizStore();
  const { wrongNotes, loadWrongNotes } = useWrongNoteStore();
  
  React.useEffect(() => {
    loadProgress();
    loadWrongNotes();
  }, [loadProgress, loadWrongNotes]);
  
  const handleStartPractice = () => {
    startQuiz();
    navigate('/quiz');
  };
  
  const activeWrongCount = wrongNotes.filter(n => !n.mastered).length;
  const accuracy = progress.totalProblems > 0 
    ? Math.round((progress.correctProblems / progress.totalProblems) * 100) 
    : 0;
  const todayProblems = getTodayProblems();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="text-center py-3 sm:py-4 md:py-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">数学小天才</h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">每天 5 分钟，数学更轻松</p>
        </div>
        
        {/* Level and XP Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm border border-gray-100 mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Lv.{progress.level}</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">经验值 {progress.points} / {progress.level * LEVEL_POINTS_DIVISOR}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">总积分</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">{progress.points}</div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
              style={{ width: `${(progress.points % (progress.level * LEVEL_POINTS_DIVISOR)) / (progress.level * LEVEL_POINTS_DIVISOR) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center mb-0.5 sm:mb-1">
              <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-sky-500" />
            </div>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{todayProblems}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600">今日练习</div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center mb-0.5 sm:mb-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-600" />
            </div>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{progress.totalSessions}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600">练习次数</div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center mb-0.5 sm:mb-1">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600" />
            </div>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{progress.totalProblems}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600">总题数</div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center mb-0.5 sm:mb-1">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-500" />
            </div>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{accuracy}%</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600">正确率</div>
          </div>
        </div>
        
        {/* Main Actions */}
        <div className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-3 sm:mb-4 md:mb-6">
          <button
            onClick={handleStartPractice}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span className="text-base sm:text-xl md:text-2xl font-bold">开始练习</span>
            </div>
            <p className="text-white/80 text-xs sm:text-sm mt-0.5">共 {config.questionCount} 道题</p>
          </button>
          
          {activeWrongCount > 0 && (
            <button
              onClick={() => navigate('/wrong-note-practice')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                <span className="text-base sm:text-lg md:text-xl font-bold">错题强化</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5">{activeWrongCount}道错题待复习</p>
            </button>
          )}
        </div>
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
          <Button variant="outline" size="lg" onClick={() => navigate('/history')} className="py-2 sm:py-3 text-xs sm:text-sm md:text-base">
            <History className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1" /> 历史记录
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/wrong-notes')} className="py-2 sm:py-3 text-xs sm:text-sm md:text-base">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1" /> 错题本
          </Button>
        </div>
        
        {/* Settings */}
        <div className="text-center">
          <button onClick={() => navigate('/settings')} className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm flex items-center gap-1 mx-auto">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" /> 练习设置
          </button>
        </div>
      </div>
    </div>
  );
};
