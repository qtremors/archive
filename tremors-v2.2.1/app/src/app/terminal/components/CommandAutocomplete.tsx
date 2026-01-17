/**
 * CommandAutocomplete Component
 * Shows command suggestions above the input as user types
 */

"use client";

import type { ThemeColors } from "../lib/types";

interface Props {
    input: string;
    commands: string[];
    theme: ThemeColors;
    selectedIndex: number;
}

export function CommandAutocomplete({ input, commands, theme, selectedIndex }: Props) {
    // Filter commands that match the input
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return null;

    // Get base commands (without / prefix)
    const baseCommands = commands.filter(c => !c.startsWith("/") && !c.startsWith(":"));

    // Match against input (with or without /)
    const searchTerm = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    const matches = baseCommands.filter(c => c.startsWith(searchTerm));

    if (matches.length === 0 || (matches.length === 1 && `/${matches[0]}` === input)) {
        return null;
    }

    return (
        <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
            <div
                className="flex flex-wrap gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: theme.panel, borderWidth: 1, borderColor: theme.border }}
            >
                {matches.slice(0, 8).map((cmd, i) => (
                    <span
                        key={cmd}
                        className="px-2 py-0.5 rounded"
                        style={{
                            backgroundColor: i === selectedIndex ? theme.primary : theme.bg,
                            color: i === selectedIndex ? theme.bg : theme.text,
                        }}
                    >
                        /{cmd}
                    </span>
                ))}
                {matches.length > 8 && (
                    <span style={{ color: theme.muted }}>+{matches.length - 8} more</span>
                )}
                <span className="ml-auto text-xs" style={{ color: theme.muted }}>
                    Tab to complete
                </span>
            </div>
        </div>
    );
}
