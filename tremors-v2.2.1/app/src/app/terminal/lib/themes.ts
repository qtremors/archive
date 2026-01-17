/**
 * Terminal Themes
 * Color schemes for the terminal
 */

import type { ThemeId, ThemeColors } from "./types";

// Official Dracula Theme colors: https://draculatheme.com/contribute
export const THEMES: Record<ThemeId, ThemeColors> = {
    dracula: {
        name: "Dracula",
        bg: "#282a36",
        text: "#f8f8f2",
        primary: "#8be9fd",     // Cyan
        secondary: "#bd93f9",   // Purple
        muted: "#6272a4",       // Comment
        error: "#ff5555",       // Red
        success: "#50fa7b",     // Green
        system: "#f1fa8c",      // Yellow
        panel: "#44475a",       // Current Line
        border: "#6272a4",      // Comment
    },
    // Official Tokyo Night colors: https://github.com/enkia/tokyo-night-vscode-theme
    tokyonight: {
        name: "Tokyo Night",
        bg: "#1a1b26",
        text: "#c0caf5",
        primary: "#7aa2f7",     // Blue
        secondary: "#bb9af7",   // Purple
        muted: "#565f89",       // Comment
        error: "#f7768e",       // Red
        success: "#9ece6a",     // Green
        system: "#e0af68",      // Yellow
        panel: "#24283b",       // Selection
        border: "#414868",      // Border
    },
    // Official Rosé Pine colors: https://rosepinetheme.com/palette
    rosepine: {
        name: "Rosé Pine",
        bg: "#191724",          // Base
        text: "#e0def4",        // Text
        primary: "#9ccfd8",     // Foam
        secondary: "#c4a7e7",   // Iris
        muted: "#6e6a86",       // Muted
        error: "#eb6f92",       // Love
        success: "#31748f",     // Pine
        system: "#f6c177",      // Gold
        panel: "#1f1d2e",       // Surface
        border: "#26233a",      // Overlay
    },
};

// Top 3 monospace fonts for terminals (using CSS variables from layout.tsx)
export const FONT_CLASSES: Record<"mono" | "firacode" | "jetbrains", string> = {
    mono: "font-mono",                           // System mono (var(--font-mono))
    firacode: "font-[var(--font-firacode)]",    // Fira Code (preloaded)
    jetbrains: "font-[var(--font-mono)]",       // JetBrains Mono (default mono)
};

