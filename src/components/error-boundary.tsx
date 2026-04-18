"use client";

import { Component } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center py-12">
          <AlertTriangle
            size={24}
            strokeWidth={1.5}
            className="text-[#E24B4A]"
          />
          <p className="mt-3 text-[13px] text-[#666]">
            Erro ao carregar este conteúdo
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 rounded-lg px-4 py-1.5 text-[11px] text-[#555] transition-colors hover:text-[#888]"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
