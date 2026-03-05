import React from 'react';
import { Trophy, Star, BookOpen, FileText, Target, Flame } from 'lucide-react';
import { UserProgress } from '../types';

interface StatsCardProps {
  progress: UserProgress;
}

export const StatsCard: React.FC<StatsCardProps> = ({ progress }) => {
  const accuracy = progress.totalProblems > 0
    ? Math.round((progress.correctProblems / progress.totalProblems) * 100)
    : 0;
  
  const stats = [
    { 
      icon: <Star className="w-5 h-5" />, 
      label: '等级', 
      value: `Lv.${progress.level}`,
      color: 'text-[var(--color-secondary)]'
    },
    { 
      icon: <Trophy className="w-5 h-5" />, 
      label: '积分', 
      value: progress.points,
      color: 'text-[var(--color-primary)]'
    },
    { 
      icon: <BookOpen className="w-5 h-5" />, 
      label: '练习次数', 
      value: progress.totalSessions,
      color: 'text-[var(--color-text-secondary)]'
    },
    { 
      icon: <FileText className="w-5 h-5" />, 
      label: '总题数', 
      value: progress.totalProblems,
      color: 'text-[var(--color-text-secondary)]'
    },
    { 
      icon: <Target className="w-5 h-5" />, 
      label: '正确率', 
      value: `${accuracy}%`,
      color: 'text-[var(--color-text-secondary)]'
    },
    { 
      icon: <Flame className="w-5 h-5" />, 
      label: '连续天数', 
      value: progress.currentStreak,
      color: 'text-[var(--color-text-secondary)]'
    },
  ];
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
          >
            <div className={`${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-lg font-semibold text-[var(--color-text-primary)]">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            已获得徽章 ({progress.badges.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.badges.map((badge) => (
              <span
                key={badge.type}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg text-sm"
                title={badge.description}
              >
                <span>{badge.icon}</span>
                <span className="text-[var(--color-text-primary)]">{badge.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};