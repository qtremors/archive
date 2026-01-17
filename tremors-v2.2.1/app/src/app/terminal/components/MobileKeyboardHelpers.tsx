/**
 * MobileKeyboardHelpers - Keyboard helper buttons for mobile terminal users
 */

"use client";

import type { ThemeColors } from "../lib/types";

interface MobileKeyboardHelpersProps {
    theme: ThemeColors;
    onUp: () => void;
    onDown: () => void;
    onTab: () => void;
    onClear: () => void;
}

export function MobileKeyboardHelpers({ theme, onUp, onDown, onTab, onClear }: MobileKeyboardHelpersProps) {
    return (
        <div className="md:hidden flex items-center justify-center gap-2 px-4 py-2 border-t" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUp(); }}
                className="flex-1 py-2 text-xs rounded border transition-colors"
                style={{ borderColor: theme.border, color: theme.muted, backgroundColor: theme.panel }}
            >
                UP
            </button>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDown(); }}
                className="flex-1 py-2 text-xs rounded border transition-colors"
                style={{ borderColor: theme.border, color: theme.muted, backgroundColor: theme.panel }}
            >
                DOWN
            </button>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTab(); }}
                className="flex-1 py-2 text-xs rounded border transition-colors"
                style={{ borderColor: theme.border, color: theme.muted, backgroundColor: theme.panel }}
            >
                TAB
            </button>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
                className="flex-1 py-2 text-xs rounded border transition-colors"
                style={{ borderColor: theme.border, color: theme.muted, backgroundColor: theme.panel }}
            >
                CLS
            </button>
        </div>
    );
}
