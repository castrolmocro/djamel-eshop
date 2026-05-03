import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4 bg-background">
          <div className="text-6xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">حدث خطأ غير متوقع</h2>
            <p className="text-muted-foreground text-sm">Une erreur inattendue s'est produite</p>
          </div>
          {this.state.error?.message && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-3 text-sm text-destructive max-w-md font-mono text-start break-words">
              {this.state.error.message}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              إعادة التحميل
            </button>
            <button
              onClick={() => { this.setState({ hasError: false }); window.history.back(); }}
              className="px-6 py-2.5 rounded-xl border text-foreground text-sm font-semibold hover:bg-muted transition-colors"
            >
              رجوع
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
