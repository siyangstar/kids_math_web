import React from 'react';
import { Trophy, Star, BookOpen, FileText, Target } from 'lucide-react';
import { UserProgress } from '../types';

// 统计卡片组件属性接口
interface StatsCardProps {
  progress: UserProgress; // 用户进度数据
}

// 统计卡片组件 - 显示用户学习统计信息
export const StatsCard: React.FC<StatsCardProps> = ({ progress }) => {
  // 计算正确率
  const accuracy = progress.totalProblems > 0
    ? Math.round((progress.correctProblems / progress.totalProblems) * 100)
    : 0;
  
  // 统计数据配置
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
  ];
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      {/* 统计数据网格 */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
          >
            {/* 图标 */}
            <div className={`${stat.color}`}>
              {stat.icon}
            </div>
            {/* 数值和标签 */}
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
    </div>
  );
};