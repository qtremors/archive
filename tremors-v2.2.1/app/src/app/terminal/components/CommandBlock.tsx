/**
 * CommandBlock Component
 * Renders a command and its output lines in a TUI panel
 */

import type { CommandBlock as CommandBlockType, ThemeColors } from "../lib/types";

interface Props {
    block: CommandBlockType;
    theme: ThemeColors;
}

export function CommandBlock({ block, theme }: Props) {
    return (
        <div
            className="rounded-lg overflow-hidden animate-fade-in"
            style={{ borderWidth: 1, borderColor: theme.border }}
        >
            {/* Panel Header */}
            <div
                className="px-4 py-2 flex items-center gap-2"
                style={{
                    backgroundColor: theme.panel,
                    borderBottomWidth: 1,
                    borderColor: theme.border
                }}
            >
                <span style={{ color: theme.primary }}>›</span>
                <span style={{ color: theme.secondary }}>{block.command}</span>
            </div>

            {/* Panel Body */}
            <div className="px-4 py-3" style={{ backgroundColor: theme.panel + '80' }}>
                {block.lines.map((line, j) => (
                    <div
                        key={j}
                        className="py-0.5 text-sm whitespace-pre-wrap"
                        style={{
                            color: line.type === "output" ? theme.muted :
                                line.type === "error" ? theme.error :
                                    line.type === "success" ? theme.success :
                                        line.type === "system" ? theme.system :
                                            line.type === "heading" ? theme.primary :
                                                theme.text,
                            fontWeight: line.type === "heading" ? 600 : 400,
                            marginTop: line.type === "heading" ? "0.5rem" : 0,
                        }}
                    >
                        {line.content}
                    </div>
                ))}
            </div>
        </div>
    );
}
