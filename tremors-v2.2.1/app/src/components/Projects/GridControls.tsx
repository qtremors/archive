/**
 * GridControls - Filter and view toggles for the ProjectsGrid
 */

"use client";

import { LayoutGrid, List, ImageIcon, ImageOff } from "lucide-react";

interface GridControlsProps {
    viewMode: "grid" | "list";
    showImages: boolean;
    onViewChange: (mode: "grid" | "list") => void;
    onImageToggle: () => void;
}

export function GridControls({ viewMode, showImages, onViewChange, onImageToggle }: GridControlsProps) {
    return (
        <div className="flex justify-end gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
                <button
                    onClick={() => onViewChange("grid")}
                    className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${viewMode === "grid"
                        ? "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}
                    title="Grid view"
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onViewChange("list")}
                    className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${viewMode === "list"
                        ? "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}
                    title="List view"
                >
                    <List className="w-4 h-4" />
                </button>
            </div>

            {/* Image Toggle */}
            <button
                onClick={onImageToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${showImages
                    ? "border-[var(--accent-cyan)] text-[var(--accent-cyan)]"
                    : "border-[var(--border)] text-[var(--text-muted)]"
                    }`}
            >
                {showImages ? <ImageIcon className="w-4 h-4" /> : <ImageOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{showImages ? "Images On" : "Images Off"}</span>
            </button>
        </div>
    );
}
