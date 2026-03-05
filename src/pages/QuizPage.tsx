import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useQuizStore, useProgressStore } from '../stores';
import { NumberPad } from '../components/NumberPad';
import { ProgressBar } from '../components/ProgressBar';
import { Timer } from '../components/Timer';
import { Button } from '../components/Button';

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    quizState, currentAnswer, setCurrentAnswer, submitAnswer, nextProblem,
    finishQuiz, resetQuiz, currentProblem, progress,
  } = useQuizStore();
  const { loadProgress } = useProgressStore();
  
  const problem = currentProblem();
  const prog = progress();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (quizState === 'playing') setIsTimerRunning(true);
    else setIsTimerRunning(false);
  }, [quizState, problem?.id]);
  
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);
  
  const handleSubmit = () => {
    if (isSubmitting || !currentAnswer) return;
    setIsSubmitting(true);
    submitAnswer();
    
    timeoutRef.current = setTimeout(() => {
      if (prog.current >= prog.total) {
        finishQuiz();
        loadProgress();
        navigate('/result');
      } else {
        nextProblem();
      }
      setIsSubmitting(false);
    }, 300);
  };
  
  const handleExit = () => {
    if (window.confirm('确定要退出练习吗？')) { resetQuiz(); navigate('/'); }
  };
  
  if (quizState === 'idle' || !problem) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-base sm:text-xl text-[var(--color-text-secondary)] mb-4">加载中...</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 退出
          </Button>
          <Timer isRunning={isTimerRunning} />
          <div className="w-12 sm:w-16" />
        </div>
        <ProgressBar current={prog.current} total={prog.total} />
      </div>
      
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="text-center mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">
              第 {prog.current} / {prog.total} 题
            </span>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-[var(--color-text-primary)]">
              {problem.expression} = <span className="text-[var(--color-primary)]">{currentAnswer || '?'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <NumberPad value={currentAnswer} onChange={setCurrentAnswer} onSubmit={handleSubmit} disabled={isSubmitting} />
      </div>
    </div>
  );
};
