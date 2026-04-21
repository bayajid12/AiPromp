import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    const { children } = this.props;
    if (this.state.hasError) {
      let isQuotaError = false;
      try {
        const errorData = JSON.parse(this.state.error?.message || '{}');
        isQuotaError = errorData.error?.includes('Quota limit exceeded') || 
                       this.state.error?.message.includes('Quota limit exceeded');
      } catch {
        isQuotaError = this.state.error?.message.includes('Quota limit exceeded') || false;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-gray-100 rounded-[32px] p-10 text-center shadow-xl shadow-black/5">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8">
              <AlertTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              {isQuotaError ? 'Daily Limit Reached' : 'Something went wrong'}
            </h2>
            
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              {isQuotaError 
                ? "We've reached our free daily data limit. The app will be back online shortly after the daily reset. Thank you for your patience!"
                : "An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."}
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              <RefreshCw size={20} />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
