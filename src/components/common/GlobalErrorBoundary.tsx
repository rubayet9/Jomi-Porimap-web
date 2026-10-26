import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  lang?: 'BN' | 'EN';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    // eslint-disable-next-line no-console
    console.error('Uncaught React component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isBn = this.props.lang !== 'EN';
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'radial-gradient(circle at 50% 50%, #121E17 0%, #080D0A 100%)',
            color: '#FFFFFF',
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: 'rgba(25, 38, 30, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '24px',
              padding: '32px 28px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.45)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <AlertOctagon size={34} color="#FFFFFF" />
            </div>

            <h2
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#FEE2E2',
                marginBottom: '10px',
              }}
            >
              {isBn ? 'একটি অপ্রত্যাশিত সমস্যা হয়েছে' : 'Something went wrong'}
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: '#94A3B8',
                lineHeight: '1.6',
                marginBottom: '20px',
              }}
            >
              {isBn
                ? 'অ্যাপ্লিকেশনটিতে একটি অভ্যন্তরীণ রেন্ডারিং ত্রুটি ঘটেছে। অনুগ্রহ করে পৃষ্ঠাটি পুনরায় লোড করুন।'
                : 'An unexpected application rendering error occurred. Please reload the application to restore.'}
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#F87171',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  marginBottom: '24px',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '15px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RotateCcw size={18} />
              <span>{isBn ? 'পুনরায় লোড করুন' : 'Reload Application'}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
