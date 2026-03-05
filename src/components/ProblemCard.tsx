import React from 'react';
import { Problem } from '../types';

interface ProblemCardProps {
  problem: Problem;
  problemNumber: number;
  totalProblems: number;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  problemNumber,
  totalProblems,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Problem number indicator */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium">
          第 {problemNumber} / {totalProblems} 题
        </span>
      </div>
      
      {/* Problem expression card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
        {/* Problem expression */}
        <div className="text-5xl font-bold text-[var(--color-text-primary)] tracking-wider mb-4">
          {problem.expression}
        </div>
        <div className="text-2xl text-[var(--color-text-secondary)] font-medium">
          = ?
        </div>
      </div>
      
      {/* Operations hint */}
      <div className="flex justify-center gap-2 mt-4">
        {problem.operations.map((op, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-[var(--color-text-secondary)] font-medium"
          >
            {op}
          </span>
        ))}
      </div>
    </div>
  );
};

// Result card for feedback
interface ResultCardProps {
  problem: Problem;
  userAnswer: number;
  isCorrect: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  problem,
  userAnswer,
  isCorrect,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Result indicator */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-semibold ${
          isCorrect
            ? 'bg-[var(--color-success)] text-white'
            : 'bg-[var(--color-error)] text-white'
        }`}>
          {isCorrect ? '回答正确！' : '回答错误'}
        </div>
      </div>
      
      {/* Problem and answers */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-[var(--color-text-primary)] mb-6">
            {problem.expression}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${
              isCorrect 
                ? 'bg-[var(--color-success)] bg-opacity-10 border-2 border-[var(--color-success)]' 
                : 'bg-[var(--color-error)] bg-opacity-10 border-2 border-[var(--color-error)]'
            }`}>
              <div className="text-sm text-[var(--color-text-secondary)] mb-1">你的答案</div>
              <div className={`text-2xl font-bold ${isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                {userAnswer}
              </div>
            </div>
            
            {!isCorrect && (
              <div className="p-4 rounded-xl bg-gray-100">
                <div className="text-sm text-[var(--color-text-secondary)] mb-1">正确答案</div>
                <div className="text-2xl font-bold text-[var(--color-success)]">
                  {problem.answer}
                </div>
              </div>
            )}
            
            {isCorrect && (
              <div className="p-4 rounded-xl bg-[var(--color-secondary)] bg-opacity-10 flex items-center justify-center">
                <div className="text-lg font-semibold text-[var(--color-secondary)]">+10 分</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};