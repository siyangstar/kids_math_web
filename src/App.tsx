import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { ResultPage } from './pages/ResultPage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { WrongNotesPage } from './pages/WrongNotesPage';
import { WrongNotePracticePage } from './pages/WrongNotePracticePage';
import { initializeStorage } from './utils/storage';
import { useProgressStore } from './stores';

// 主应用组件
function App() {
  const { loadProgress } = useProgressStore();
  
  // 应用初始化
  React.useEffect(() => {
    initializeStorage(); // 初始化本地存储
    loadProgress(); // 加载用户进度
  }, [loadProgress]);

  return (
    // 使用错误边界包裹整个应用
    <ErrorBoundary>
      <BrowserRouter basename="/kids_math">
        <Routes>
          {/* 首页 */}
          <Route path="/" element={<HomePage />} />
          {/* 测验页面 */}
          <Route path="/quiz" element={<QuizPage />} />
          {/* 结果页面 */}
          <Route path="/result" element={<ResultPage />} />
          {/* 设置页面 */}
          <Route path="/settings" element={<SettingsPage />} />
          {/* 历史记录页面 */}
          <Route path="/history" element={<HistoryPage />} />
          {/* 错题本页面 */}
          <Route path="/wrong-notes" element={<WrongNotesPage />} />
          {/* 错题练习页面 */}
          <Route path="/wrong-note-practice" element={<WrongNotePracticePage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
