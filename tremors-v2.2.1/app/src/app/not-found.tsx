/**
 * Custom 404 Page - Not Found
 * Styled consistently with the portfolio theme
 */

import Link from "next/link";
import { Home, Terminal } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
            <div className="text-center px-6">
                {/* 404 Code */}
                <div className="mb-8">
                    <span className="text-8xl md:text-9xl font-bold text-[var(--text-muted)] opacity-20">
                        404
                    </span>
                </div>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    Page Not Found
                </h1>
                <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-cyan)] text-black rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <Link
                        href="/terminal"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border)] rounded-full hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all"
                    >
                        <Terminal className="w-4 h-4" />
                        Open Terminal
                    </Link>
                </div>
            </div>
        </div>
    );
}
