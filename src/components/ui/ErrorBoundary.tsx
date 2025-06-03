import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary komponent do obsługi nieoczekiwanych błędów React
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary złapał błąd:", error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="font-semibold">Wystąpił nieoczekiwany błąd</h3>
                  </div>
                  
                  <p className="text-sm">
                    Przepraszamy, coś poszło nie tak. Spróbuj odświeżyć stronę lub skontaktuj się z pomocą techniczną.
                  </p>
                  
                  {this.state.error && process.env.NODE_ENV === "development" && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs font-mono">
                        Szczegóły błędu (tylko dla deweloperów)
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {this.state.error.message}
                        {this.state.error.stack && (
                          <>
                            {"\n\n"}
                            {this.state.error.stack}
                          </>
                        )}
                      </pre>
                    </details>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={this.handleRetry}
                      className="flex-1"
                    >
                      🔄 Spróbuj ponownie
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="flex-1"
                    >
                      🔃 Odśwież stronę
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary dla komponentów funkcyjnych
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
} 