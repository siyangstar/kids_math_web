import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SettingsComponent } from '../components/Settings';
import { useQuizStore } from '../stores';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, setConfig, startQuiz } = useQuizStore();
  
  const handleStart = () => {
    startQuiz();
    navigate('/quiz');
  };
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        
        <SettingsComponent
          config={config}
          onConfigChange={setConfig}
          onStart={handleStart}
        />
      </div>
    </div>
  );
};
