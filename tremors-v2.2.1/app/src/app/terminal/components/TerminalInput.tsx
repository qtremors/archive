/**
 * TerminalInput Component
 * Input field at the bottom of the terminal
 */

import { forwardRef } from "react";
import type { ThemeColors } from "../lib/types";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    theme: ThemeColors;
    awaitingPassword: boolean;
    shaking: boolean;
    hidden?: boolean;
}

export const TerminalInput = forwardRef<HTMLInputElement, Props>(
    function TerminalInput({ value, onChange, onKeyDown, theme, awaitingPassword, shaking, hidden }, ref) {
        if (hidden) return null;

        return (
            <div className="p-4 max-w-3xl mx-auto w-full">
                <div
                    className={`border rounded-lg px-4 py-2 flex items-center gap-2 ${shaking ? 'animate-shake' : ''}`}
                    style={{ borderColor: theme.border, backgroundColor: theme.panel }}
                >
                    <span style={{ color: theme.primary }}>›</span>
                    <input
                        ref={ref}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={awaitingPassword ? "password" : ""}
                        className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none appearance-none text-sm"
                        style={{
                            boxShadow: 'none',
                            color: theme.text,
                            caretColor: theme.primary,
                            WebkitTextSecurity: awaitingPassword ? 'disc' : 'none'
                        } as React.CSSProperties}
                        aria-label={awaitingPassword ? "Enter password" : "Enter terminal command"}
                        autoComplete="off"
                        autoFocus
                        spellCheck={false}
                    />
                </div>
            </div>
        );
    }
);
