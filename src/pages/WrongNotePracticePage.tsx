import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useWrongNoteStore, useQuizStore, useProgressStore } from '../stores';
import { NumberPad } from '../components/NumberPad';
import { ProgressBar } from '../components/ProgressBar';
import { Timer } from '../components/Timer';
import { Button } from '../components/Button';
import { Problem, Answer } from '../types';
import { calculateScore } from '../core/math/generator';

export const WrongNotePracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { wrongNotes, loadWrongNotes } = useWrongNoteStore();
  const { config } = useQuizStore();
  const { loadProgress } = useProgressStore();
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => { loadWrongNotes(); }, [loadWrongNotes]);
  
  useEffect(() => {
    const activeNotes = wrongNotes.filter(n => !n.mastered);
    const wrongProblems = activeNotes.map(n => n.problem).slice(0, config.questionCount);
    
    if (wrongProblems.length < config.questionCount) {
      const needed = config.questionCount - wrongProblems.length;
      for (let i = 0; i < needed && i < activeNotes.length; i++) {
        wrongProblems.push(activeNotes[i % activeNotes.length].problem);
      }
    }
    
    setProblems(wrongProblems);
    setStartTime(Date.now());
    setIsTimerRunning(true);
  }, [wrongNotes, config.questionCount]);
  
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);
  
  const handleSubmit = () => {
    if (isSubmitting || !currentAnswer) return;
    
    setIsSubmitting(true);
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
    
    setAnswers([...answers, answer]);
    
    timeoutRef.current = setTimeout(() => {
      if (currentIndex >= problems.length - 1) {
        finishPractice([...answers, answer]);
      } else {
        setCurrentIndex(currentIndex + 1);
        setCurrentAnswer('');
        setIsSubmitting(false);
      }
    }, 300);
  };
  
  const finishPractice = (allAnswers: Answer[]) => {
    setIsTimerRunning(false);
    const correctCount = allAnswers.filter(a => a.isCorrect).length;
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const score = calculateScore(correctCount, totalTime, problems.length);
    
    navigate('/result', { 
      state: { 
        isWrongNotePractice: true,
        correctCount,
        totalCount: problems.length,
        score,
        totalTime
      } 
    });
  };
  
  const handleExit = () => {
    if (window.confirm('确定要退出练习吗？')) navigate('/');
  };
  
  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-base sm:text-xl text-[var(--color-text-secondary)] mb-4">没有错题需要练习</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }
  
  const problem = problems[currentIndex];
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 退出
          </Button>
          <div className="text-base sm:text-lg font-bold text-[var(--color-secondary)]">错题强化</div>
          <Timer isRunning={isTimerRunning} />
        </div>
        <ProgressBar current={currentIndex + 1} total={problems.length} />
      </div>
      
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[var(--color-primary)] shadow-sm">
          <div className="text-center mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-[var(--color-primary)]">
              第 {currentIndex + 1} / {problems.length} 题
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
