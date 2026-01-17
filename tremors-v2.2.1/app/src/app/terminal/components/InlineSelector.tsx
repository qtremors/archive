/**
 * InlineSelector Component
 * Inline TUI for selecting theme or font, rendered within terminal flow
 */

"use client";

import { useEffect, useCallback } from "react";
import type { ThemeColors, ThemeId } from "../lib/types";
import { THEMES } from "../lib/themes";

interface Props {
    type: "theme" | "font";
    options: string[];
    selectedIndex: number;
    theme: ThemeColors;
    onSelect: (value: string) => void;
    onNavigate: (direction: "up" | "down") => void;
    onCancel: () => void;
}

export function InlineSelector({
    type,
    options,
    selectedIndex,
    theme,
    onSelect,
    onNavigate,
    onCancel,
}: Props) {
    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                onNavigate("up");
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                onNavigate("down");
            } else if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                onSelect(options[selectedIndex]);
            } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
            }
        },
        [options, selectedIndex, onSelect, onNavigate, onCancel]
    );

    useEffect(() => {
        // Delay adding listener to avoid catching the Enter key that triggered this selector
        const frameId = requestAnimationFrame(() => {
            window.addEventListener("keydown", handleKeyDown);
        });
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    const title = type === "theme" ? "Select Theme" : "Select Font";

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
                <span style={{ color: theme.primary }}>›</span>
                <span style={{ color: theme.secondary }}>{title}</span>
            </div>

            {/* Options */}
            <div className="py-2" style={{ backgroundColor: theme.panel + "80" }}>
                {options.map((opt, i) => (
                    <div
                        key={opt}
                        className="px-4 py-1.5 flex items-center gap-3 cursor-pointer transition-colors"
                        style={{
                            backgroundColor: i === selectedIndex ? theme.bg : "transparent",
                            color: i === selectedIndex ? theme.primary : theme.text,
                        }}
                        onClick={() => onSelect(opt)}
                    >
                        <span style={{ color: theme.primary, width: "1rem" }}>
                            {i === selectedIndex ? "→" : " "}
                        </span>
                        <span>
                            {type === "theme"
                                ? THEMES[opt as ThemeId].name
                                : opt === "mono" ? "System Mono"
                                    : opt === "firacode" ? "Fira Code"
                                        : opt === "jetbrains" ? "JetBrains Mono" : opt}
                        </span>
                    </div>
                ))}
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
                ↑↓ navigate • Enter select • Esc cancel
            </div>
        </div>
    );
}
