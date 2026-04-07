import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level?: "page" | "section";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ModuleErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error boundary caught:", error, info);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSection = this.props.level === "section";

      return (
        <div
          className={
            isSection
              ? "rounded-lg border border-destructive/20 bg-destructive/5 p-4"
              : "flex min-h-[50vh] flex-col items-center justify-center p-4"
          }
        >
          <p className="font-medium text-foreground">
            {isSection ? "Gagal memuat bagian ini" : "Terjadi Kesalahan"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {this.state.error?.message ?? "Terjadi kesalahan yang tidak terduga"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
