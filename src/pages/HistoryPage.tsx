import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Trophy, ChevronRight, Eraser, Trash2, XCircle } from 'lucide-react';
import { useHistoryStore, useQuizStore } from '../stores';
import { Button } from '../components/Button';
import { SessionResult } from '../types';

const HistoryDetailModal: React.FC<{
  session: SessionResult;
  onClose: () => void;
  onRetry: (session: SessionResult) => void;
}> = ({ session, onClose, onRetry }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">练习详情</h2>
              <p className="text-sm text-gray-500 mt-1">{formatDate(session.date)}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600">{session.problems.length}</div>
              <div className="text-xs text-gray-500">总题数</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">{session.correctCount}</div>
              <div className="text-xs text-emerald-600">正确</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{session.problems.length - session.correctCount}</div>
              <div className="text-xs text-red-600">错误</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <div className="text-2xl font-bold text-amber-600">{session.score}</div>
              <div className="text-xs text-amber-600">得分</div>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-3">题目列表</h3>
          <div className="space-y-2">
            {session.problems.map((problem, index) => {
              const answer = session.answers[index];
              return (
                <div key={index} className={`p-3 rounded-lg flex justify-between items-center ${
                  answer.isCorrect ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      answer.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="font-medium">{problem.expression} = {problem.answer}</span>
                  </div>
                  <span className={`text-sm ${answer.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                    {answer.isCorrect ? '正确' : `你的答案：${answer.userAnswer}`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" size="md" onClick={() => onRetry(session)}>重新练习这一组</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { startQuizWithProblems } = useQuizStore();
  const { history, loadHistory, clearAllHistory, removeHistoryItems } = useHistoryStore();
  const [selectedSession, setSelectedSession] = useState<SessionResult | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };
  
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
      clearAllHistory();
    }
  };
  
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };
  
  const selectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(h => h.id)));
    }
  };
  
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) {
      removeHistoryItems(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsSelectMode(false);
    }
  };
  
  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };
  
  const handleRetrySession = (session: SessionResult) => {
    const shuffledProblems = [...session.problems].sort(() => Math.random() - 0.5);
    startQuizWithProblems(shuffledProblems, {
      ...session.config,
      questionCount: shuffledProblems.length,
    });
    setSelectedSession(null);
    navigate('/quiz');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            历史记录
          </h1>
          <div className="w-16" />
        </div>
        
        {history.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            {!isSelectMode ? (
              <>
                <div />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsSelectMode(true)}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <Check className="w-4 h-4 mr-1" /> 批量选择
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearAll}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Eraser className="w-4 h-4 mr-1" /> 清空所有
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={exitSelectMode}
                  className="text-gray-600"
                >
                  <XCircle className="w-4 h-4 mr-1" /> 取消
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAll}
                    className="text-gray-600 border-gray-200"
                  >
                    {selectedIds.size === history.length ? '取消全选' : '全选'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBatchDelete}
                    disabled={selectedIds.size === 0}
                    className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> 删除 ({selectedIds.size})
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">还没有练习记录</p>
            <Button variant="primary" size="md" onClick={() => navigate('/settings')} className="mt-4">开始练习</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((session) => {
              const accuracy = Math.round((session.correctCount / session.problems.length) * 100);
              const isSelected = selectedIds.has(session.id);
              
              return (
                <div
                  key={session.id}
                  className={`relative bg-white rounded-2xl p-5 border shadow-sm transition-all ${
                    isSelectMode && isSelected 
                      ? 'border-indigo-500 ring-2 ring-indigo-200' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  {isSelectMode && (
                    <div 
                      className="absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors"
                      onClick={() => toggleSelect(session.id)}
                    >
                      <div className={`w-4 h-4 rounded-full ${isSelected ? 'bg-indigo-600' : 'bg-transparent'}`} />
                    </div>
                  )}
                  <button
                    onClick={() => isSelectMode ? toggleSelect(session.id) : setSelectedSession(session)}
                    className={`w-full text-left ${isSelectMode ? 'pl-8' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-sm text-gray-500">
                          {new Date(session.date).toLocaleDateString('zh-CN')}
                        </div>
                        <div className="font-bold text-gray-900">{session.problems.length} 道题</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${
                          accuracy === 100 ? 'text-emerald-600' :
                          accuracy >= 80 ? 'text-indigo-600' :
                          accuracy >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>{accuracy}%</div>
                        {!isSelectMode && <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-600" /><span className="text-emerald-600">{session.correctCount}</span></div>
                      <div className="flex items-center gap-1"><X className="w-4 h-4 text-red-600" /><span className="text-red-600">{session.problems.length - session.correctCount}</span></div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{formatTime(session.totalTime)}</span></div>
                      <div className="flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-600" /><span className="text-amber-600">{session.score}分</span></div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedSession && (
        <HistoryDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} onRetry={handleRetrySession} />
      )}
    </div>
  );
};