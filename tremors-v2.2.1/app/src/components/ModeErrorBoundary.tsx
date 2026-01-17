/**
 * Mode-specific Error Boundaries
 * B-003: Error boundaries for each view mode
 */

"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    mode: "default" | "terminal" | "paper" | "newspaper" | "nexus";
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// Mode-specific styling
const MODE_STYLES: Record<string, { bg: string; text: string; accent: string }> = {
    default: { bg: "bg-[#0a0a0f]", text: "text-white", accent: "text-cyan-400" },
    terminal: { bg: "bg-[#191724]", text: "text-[#e0def4]", accent: "text-[#9ccfd8]" },
    paper: { bg: "bg-[#faf7f2]", text: "text-[#1a1a1a]", accent: "text-[#8b5a2b]" },
    newspaper: { bg: "bg-[#fef9f3]", text: "text-[#1a1a1a]", accent: "text-[#8b4513]" },
    nexus: { bg: "bg-black", text: "text-white", accent: "text-purple-400" },
};

export class ModeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[${this.props.mode}] Error:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const styles = MODE_STYLES[this.props.mode] || MODE_STYLES.default;

            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={`min-h-screen ${styles.bg} ${styles.text} flex items-center justify-center p-8`}>
                    <div className="max-w-md text-center">
                        <h2 className={`text-2xl font-bold mb-4 ${styles.accent}`}>
                            Something went wrong
                        </h2>
                        <p className="opacity-70 mb-6">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className={`px-4 py-2 border rounded ${styles.accent} border-current hover:opacity-80 transition`}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
