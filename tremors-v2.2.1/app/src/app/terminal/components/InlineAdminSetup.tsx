/**
 * InlineAdminSetup Component
 * Inline TUI for first-time admin password setup
 */

"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import type { ThemeColors } from "../lib/types";

interface Props {
    theme: ThemeColors;
    onSuccess: () => void;
    onCancel: () => void;
}

export function InlineAdminSetup({ theme, onSuccess, onCancel }: Props) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [activeField, setActiveField] = useState<"password" | "confirm">("password");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        passwordRef.current?.focus();
    }, []);

    const handleSubmit = async () => {
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "setup",
                    password,
                    confirmPassword,
                }),
            });

            const data = await res.json();
            if (data.success) {
                onSuccess();
            } else {
                setError(data.error || "Failed to create account");
            }
        } catch {
            setError("Network error. Please try again.");
        }
        setLoading(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        } else if (e.key === "Tab") {
            e.preventDefault();
            if (activeField === "password") {
                setActiveField("confirm");
                confirmRef.current?.focus();
            } else {
                setActiveField("password");
                passwordRef.current?.focus();
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeField === "password" && password.length > 0) {
                setActiveField("confirm");
                confirmRef.current?.focus();
            } else if (activeField === "confirm") {
                handleSubmit();
            }
        }
    };

    return (
        <div
            className="rounded-lg overflow-hidden"
            style={{ borderWidth: 1, borderColor: theme.border }}
            onKeyDown={handleKeyDown}
        >
            {/* Header */}
            <div
                className="px-4 py-2 flex items-center gap-2"
                style={{
                    backgroundColor: theme.panel,
                    borderBottomWidth: 1,
                    borderColor: theme.border,
                }}
            >
                <span>🔐</span>
                <span style={{ color: theme.secondary }}>Create Admin Account</span>
            </div>

            {/* Body */}
            <div className="p-4" style={{ backgroundColor: theme.panel + "80" }}>
                <p className="text-sm mb-4" style={{ color: theme.muted }}>
                    No admin account exists. Create one to manage your portfolio.
                </p>

                {/* Password field */}
                <div className="mb-3">
                    <label
                        className="block text-xs uppercase tracking-wider mb-1"
                        style={{ color: theme.muted }}
                    >
                        New Password
                    </label>
                    <input
                        ref={passwordRef}
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setActiveField("password")}
                        className="w-full px-3 py-1.5 rounded border bg-transparent text-sm"
                        style={{
                            borderColor: activeField === "password" ? theme.primary : theme.border,
                            color: theme.text,
                            caretColor: theme.primary,
                            WebkitTextSecurity: "disc",
                        } as React.CSSProperties}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-lpignore="true"
                        data-form-type="other"
                    />
                </div>

                {/* Confirm password field */}
                <div className="mb-3">
                    <label
                        className="block text-xs uppercase tracking-wider mb-1"
                        style={{ color: theme.muted }}
                    >
                        Confirm Password
                    </label>
                    <input
                        ref={confirmRef}
                        type="text"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setActiveField("confirm")}
                        className="w-full px-3 py-1.5 rounded border bg-transparent text-sm"
                        style={{
                            borderColor: activeField === "confirm" ? theme.primary : theme.border,
                            color: theme.text,
                            caretColor: theme.primary,
                            WebkitTextSecurity: "disc",
                        } as React.CSSProperties}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-lpignore="true"
                        data-form-type="other"
                    />
                </div>

                {/* Requirements */}
                <div
                    className="text-xs mb-3 p-2 rounded"
                    style={{ backgroundColor: theme.bg }}
                >
                    <p style={{ color: password.length >= 8 ? theme.success : theme.muted }}>
                        {password.length >= 8 ? "✓" : "○"} At least 8 characters
                    </p>
                    <p style={{ color: password === confirmPassword && password.length > 0 ? theme.success : theme.muted }}>
                        {password === confirmPassword && password.length > 0 ? "✓" : "○"} Passwords match
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm mb-3" style={{ color: theme.error }}>
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || password.length < 8 || password !== confirmPassword}
                        className="flex-1 px-3 py-1.5 rounded font-medium text-sm disabled:opacity-50"
                        style={{
                            backgroundColor: theme.primary,
                            color: theme.bg,
                        }}
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded text-sm border"
                        style={{
                            borderColor: theme.border,
                            color: theme.muted,
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div
                className="px-4 py-2 text-xs text-center"
                style={{
                    backgroundColor: theme.panel,
                    borderTopWidth: 1,
                    borderColor: theme.border,
                    color: theme.muted,
                }}
            >
                Tab: switch field • Enter: submit • Esc: cancel
            </div>
        </div>
    );
}
