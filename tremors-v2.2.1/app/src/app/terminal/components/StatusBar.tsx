/**
 * StatusBar Component
 * Bottom status bar showing terminal info with mobile back button
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ThemeColors, ThemeId, FontId } from "../lib/types";

interface Props {
    theme: ThemeColors;
    themeId: ThemeId;
    font: FontId;
    isAdmin: boolean;
}

export function StatusBar({ theme, themeId, font, isAdmin }: Props) {
    return (
        <div
            className="flex items-center justify-between px-4 py-1 text-xs"
            style={{ backgroundColor: theme.panel, borderTopWidth: 1, borderColor: theme.border }}
        >
            {/* Back button for mobile */}
            <Link
                href="/"
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: theme.muted }}
            >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">exit</span>
            </Link>

            <div className="flex gap-4" style={{ color: theme.muted }}>
                <span>{themeId}</span>
                <span>{font}</span>
            </div>
            <div style={{ color: theme.muted }}>
                {isAdmin && <span style={{ color: theme.success }}>● admin </span>}
                tremors-term v2.0
            </div>
        </div>
    );
}
