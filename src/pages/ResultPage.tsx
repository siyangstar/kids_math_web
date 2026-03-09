import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, PartyPopper, BookOpen, RefreshCw, Home } from 'lucide-react';
import { Button } from '../components/Button';
import { useQuizStore } from '../stores';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { problems, answers, resetQuiz, startQuiz } = useQuizStore();
  
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = problems.length;
  const score = correctCount * 10;
  
  const handleTryAgain = () => {
    resetQuiz();
    startQuiz();
    navigate('/quiz');
  };
  
  const handleGoHome = () => {
    resetQuiz();
    navigate('/');
  };
  
  const wrongAnswers = answers
    .map((answer, index) => ({ answer, problem: problems[index] }))
    .filter(({ answer }) => !answer.isCorrect);
  
  const getResultMessage = () => {
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    if (accuracy === 100) return { title: '太棒了！全对！', subtitle: '你是数学天才！', icon: Trophy, color: 'text-[var(--color-secondary)]' };
    if (accuracy >= 80) return { title: '做得很好！', subtitle: '继续保持！', icon: PartyPopper, color: 'text-[var(--color-primary)]' };
    if (accuracy >= 60) return { title: '继续加油！', subtitle: '还有进步空间', icon: BookOpen, color: 'text-[var(--color-text-secondary)]' };
    return { title: '再接再厉！', subtitle: '多多练习就会进步', icon: BookOpen, color: 'text-[var(--color-text-secondary)]' };
  };
  
  const resultMessage = getResultMessage();
  const ResultIcon = resultMessage.icon;
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
        {/* Compact header */}
        <div className="text-center py-3 sm:py-4">
          <ResultIcon className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 ${resultMessage.color}`} />
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">{resultMessage.title}</h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">{resultMessage.subtitle}</p>
        </div>
        
        {/* Score display - inline with "分" */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-3 sm:mb-4">
            <span className="text-5xl sm:text-6xl font-bold text-[var(--color-primary)]">{score}</span>
            <span className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">分</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-2 sm:p-3 bg-[var(--color-bg-secondary)] rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">{totalCount}</div>
              <div className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">总题数</div>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-success)]">{correctCount}</div>
              <div className="text-[10px] sm:text-xs text-[var(--color-success)]">正确</div>
            </div>
            <div className="p-2 sm:p-3 bg-red-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-error)]">{totalCount - correctCount}</div>
              <div className="text-[10px] sm:text-xs text-[var(--color-error)]">错误</div>
            </div>
          </div>
        </div>
        
        {/* Wrong answers - more space */}
        {wrongAnswers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-2 sm:mb-3">错题回顾</h2>
            <div className="space-y-2">
              {wrongAnswers.map(({ problem, answer }, index) => (
                <div key={index} className="p-2 sm:p-3 bg-red-50 rounded-lg border-l-4 border-[var(--color-error)] flex justify-between items-center text-sm sm:text-base">
                  <span className="font-semibold text-[var(--color-text-primary)]">{problem.expression} = {problem.answer}</span>
                  <span className="text-[var(--color-error)]">你的答案: {answer.userAnswer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <Button variant="primary" size="lg" onClick={handleTryAgain} className="flex-1 text-sm sm:text-base">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> 再来一组
          </Button>
          <Button variant="outline" size="lg" onClick={handleGoHome} className="flex-1 text-sm sm:text-base">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> 返回首页
          </Button>
        </div>
      </div>
    </div>
  );
};
