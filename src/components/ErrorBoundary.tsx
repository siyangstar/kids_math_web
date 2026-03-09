import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

// 错误边界组件属性接口
interface Props {
  children: ReactNode; // 子组件
  fallback?: ReactNode; // 自定义错误界面
}

// 错误边界组件状态接口
interface State {
  hasError: boolean; // 是否有错误
  error: Error | null; // 错误对象
}

// React错误边界组件 - 捕获子组件中的错误并显示友好的错误界面
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // 静态方法：从错误中派生状态
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // 生命周期方法：捕获错误
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  // 重置错误状态
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  // 返回首页
  handleGoHome = () => {
    window.location.href = '/kids_math/';
  };

  // 渲染方法
  render() {
    if (this.state.hasError) {
      // 如果有自定义错误界面，使用自定义界面
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 text-center">
            {/* 错误图标 */}
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            
            {/* 错误标题 */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              哎呀，出错了
            </h1>
            
            {/* 错误描述 */}
            <p className="text-gray-600 mb-6">
              应用遇到了一个问题，请尝试刷新页面或返回首页。
            </p>
            
            {/* 开发环境显示错误详情 */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm font-mono text-red-600 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={this.handleReset}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={this.handleGoHome}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // 无错误时正常渲染子组件
    return this.props.children;
  }
}
