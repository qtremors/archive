/**
 * TerminalHistory - Renders the history of command blocks
 */

"use client";

import { CommandBlock } from "./CommandBlock";
import type { CommandBlock as CommandBlockType, ThemeColors } from "../lib/types";

interface TerminalHistoryProps {
    blocks: CommandBlockType[];
    theme: ThemeColors;
}

export function TerminalHistory({ blocks, theme }: TerminalHistoryProps) {
    if (blocks.length === 0) return null;

    return (
        <div className="px-6 pb-4 max-w-3xl mx-auto w-full space-y-4">
            {blocks.map((block, i) => (
                <CommandBlock key={i} block={block} theme={theme} />
            ))}
        </div>
    );
}
