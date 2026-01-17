/**
 * InlineAdminManage Component
 * Inline TUI for admin management (change password, logout)
 */

"use client";

import { useState, useRef, useEffect, useCallback, useMemo, KeyboardEvent } from "react";
import type { ThemeColors } from "../lib/types";

interface Props {
    theme: ThemeColors;
    onLogout: () => void;
    onClose: () => void;
    sessionInfo?: { expiresIn: number } | null;
}

type MenuOption = "changePassword" | "logout" | "cancel";
type View = "menu" | "changePassword";

export function InlineAdminManage({ theme, onLogout, onClose, sessionInfo }: Props) {
    const [view, setView] = useState<View>("menu");
    const [selectedOption, setSelectedOption] = useState<MenuOption>("changePassword");

    // Change password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [activeField, setActiveField] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const currentRef = useRef<HTMLInputElement>(null);
    const newRef = useRef<HTMLInputElement>(null);
    const confirmRef = useRef<HTMLInputElement>(null);

    const menuOptions = useMemo((): { id: MenuOption; label: string }[] => [
        { id: "changePassword", label: "Change Password" },
        { id: "logout", label: "Logout" },
        { id: "cancel", label: "Cancel" },
    ], []);

    const formatExpiresIn = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const handleLogout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            onLogout();
        } catch {
            setError("Failed to logout");
        }
    }, [onLogout]);

    const handleMenuSelect = useCallback((option: MenuOption) => {
        if (option === "changePassword") {
            setView("changePassword");
            setActiveField(0);
            setTimeout(() => currentRef.current?.focus(), 0);
        } else if (option === "logout") {
            handleLogout();
        } else {
            onClose();
        }
    }, [handleLogout, onClose]);

    const handleChangePassword = async () => {
        setError(null);
        setSuccess(null);

        if (!currentPassword) {
            setError("Current password is required");
            return;
        }
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "changePassword",
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess("Password changed!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    setView("menu");
                    setSuccess(null);
                }, 1000);
            } else {
                setError(data.error || "Failed to change password");
            }
        } catch {
            setError("Network error");
        }
        setLoading(false);
    };

    // Keyboard handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
            if (view === "menu") {
                if (e.key === "Escape") {
                    e.preventDefault();
                    onClose();
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const idx = menuOptions.findIndex((o: { id: MenuOption }) => o.id === selectedOption);
                    const newIdx = idx > 0 ? idx - 1 : menuOptions.length - 1;
                    setSelectedOption(menuOptions[newIdx].id);
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const idx = menuOptions.findIndex((o: { id: MenuOption }) => o.id === selectedOption);
                    const newIdx = idx < menuOptions.length - 1 ? idx + 1 : 0;
                    setSelectedOption(menuOptions[newIdx].id);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    handleMenuSelect(selectedOption);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [view, selectedOption, onClose, menuOptions, handleMenuSelect]);

    const handlePasswordKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            setView("menu");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError(null);
        } else if (e.key === "Tab") {
            e.preventDefault();
            const next = (activeField + 1) % 3;
            setActiveField(next);
            [currentRef, newRef, confirmRef][next].current?.focus();
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeField < 2) {
                const next = activeField + 1;
                setActiveField(next);
                [currentRef, newRef, confirmRef][next].current?.focus();
            } else {
                handleChangePassword();
            }
        }
    };

    return (
        <div
            className="rounded-lg overflow-hidden"
            style={{ borderWidth: 1, borderColor: theme.border }}
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
                <span>{view === "menu" ? "⚙️" : "🔄"}</span>
                <span style={{ color: theme.secondary }}>
                    {view === "menu" ? "Admin Management" : "Change Password"}
                </span>
            </div>

            {/* Body */}
            <div
                className="p-4"
                style={{ backgroundColor: theme.panel + "80" }}
                onKeyDown={view === "changePassword" ? handlePasswordKeyDown : undefined}
            >
                {view === "menu" ? (
                    <>
                        {/* Session info */}
                        <div className="text-sm mb-3" style={{ color: theme.muted }}>
                            <span>Logged in as: </span>
                            <span style={{ color: theme.success }}>admin</span>
                            {sessionInfo && (
                                <span> • expires {formatExpiresIn(sessionInfo.expiresIn)}</span>
                            )}
                        </div>

                        {/* Menu options */}
                        <div
                            className="rounded border"
                            style={{ borderColor: theme.border }}
                        >
                            {menuOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => handleMenuSelect(option.id)}
                                    className="px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors"
                                    style={{
                                        backgroundColor: selectedOption === option.id ? theme.bg : "transparent",
                                        color: selectedOption === option.id ? theme.primary : theme.text,
                                        borderBottom: option.id !== "cancel" ? `1px solid ${theme.border}` : "none",
                                    }}
                                >
                                    <span style={{ color: theme.primary, width: "1rem" }}>
                                        {selectedOption === option.id ? "→" : " "}
                                    </span>
                                    {option.label}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <p className="text-sm mt-3" style={{ color: theme.error }}>
                                {error}
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        {/* Current password */}
                        <div className="mb-3">
                            <label
                                className="block text-xs uppercase tracking-wider mb-1"
                                style={{ color: theme.muted }}
                            >
                                Current Password
                            </label>
                            <input
                                ref={currentRef}
                                type="text"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onFocus={() => setActiveField(0)}
                                className="w-full px-3 py-1.5 rounded border bg-transparent text-sm"
                                style={{
                                    borderColor: activeField === 0 ? theme.primary : theme.border,
                                    color: theme.text,
                                    caretColor: theme.primary,
                                    WebkitTextSecurity: "disc",
                                } as React.CSSProperties}
                                autoComplete="off"
                                autoFocus
                            />
                        </div>

                        {/* New password */}
                        <div className="mb-3">
                            <label
                                className="block text-xs uppercase tracking-wider mb-1"
                                style={{ color: theme.muted }}
                            >
                                New Password
                            </label>
                            <input
                                ref={newRef}
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onFocus={() => setActiveField(1)}
                                className="w-full px-3 py-1.5 rounded border bg-transparent text-sm"
                                style={{
                                    borderColor: activeField === 1 ? theme.primary : theme.border,
                                    color: theme.text,
                                    caretColor: theme.primary,
                                    WebkitTextSecurity: "disc",
                                } as React.CSSProperties}
                                autoComplete="off"
                            />
                        </div>

                        {/* Confirm password */}
                        <div className="mb-3">
                            <label
                                className="block text-xs uppercase tracking-wider mb-1"
                                style={{ color: theme.muted }}
                            >
                                Confirm New Password
                            </label>
                            <input
                                ref={confirmRef}
                                type="text"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={() => setActiveField(2)}
                                className="w-full px-3 py-1.5 rounded border bg-transparent text-sm"
                                style={{
                                    borderColor: activeField === 2 ? theme.primary : theme.border,
                                    color: theme.text,
                                    caretColor: theme.primary,
                                    WebkitTextSecurity: "disc",
                                } as React.CSSProperties}
                                autoComplete="off"
                            />
                        </div>

                        {/* Error / Success */}
                        {error && (
                            <p className="text-sm mb-3" style={{ color: theme.error }}>
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="text-sm mb-3" style={{ color: theme.success }}>
                                {success}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="flex-1 px-3 py-1.5 rounded font-medium text-sm disabled:opacity-50"
                                style={{
                                    backgroundColor: theme.primary,
                                    color: theme.bg,
                                }}
                            >
                                {loading ? "Updating..." : "Update"}
                            </button>
                            <button
                                onClick={() => {
                                    setView("menu");
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setError(null);
                                }}
                                className="px-3 py-1.5 rounded text-sm border"
                                style={{
                                    borderColor: theme.border,
                                    color: theme.muted,
                                }}
                            >
                                Back
                            </button>
                        </div>
                    </>
                )}
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
                {view === "menu"
                    ? "↑↓ navigate • Enter select • Esc close"
                    : "Tab: switch • Enter: submit • Esc: back"}
            </div>
        </div>
    );
}
