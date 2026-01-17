/**
 * NewspaperHeader - Masthead and control buttons for Newspaper mode
 */

"use client";

import { Calendar, RefreshCw, Settings2, Rss, Sun, Moon } from "lucide-react";
import { NEWS_AGENT } from "@/config/site";

interface NewspaperHeaderProps {
    dateStr: string;
    isAdmin: boolean;
    isRegenerating: boolean;
    selectedPersonality: string;
    theme: string;
    onShowArchive: () => void;
    onRegenerate: () => void;
    onShowSettings: () => void;
    onToggleTheme: () => void;
}

export function NewspaperHeader({
    dateStr,
    isAdmin,
    isRegenerating,
    selectedPersonality,
    theme,
    onShowArchive,
    onRegenerate,
    onShowSettings,
    onToggleTheme,
}: NewspaperHeaderProps) {
    return (
        <header className="text-center border-b-[3px] border-double border-[var(--np-ink)] pb-6 mb-8">
            <p className="text-[0.75rem] uppercase tracking-[3px] mb-2">{dateStr} • Online Edition</p>
            <h1 className="font-display text-[clamp(3rem,10vw,6rem)] font-[900] tracking-[-2px] leading-none mb-2">TREMORS</h1>
            <p className="italic text-[var(--np-ink-light)]">"All the Code That's Fit to Ship"</p>
            <div className="mt-4 flex justify-center gap-4 flex-wrap">
                {/* Archive button */}
                <button onClick={onShowArchive} className="inline-flex items-center gap-2 bg-none border border-[var(--np-ink)] px-4 py-2 font-inherit text-[0.85rem] cursor-pointer text-[var(--np-ink)] no-underline transition-all duration-200 hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)]">
                    <Calendar className="w-4 h-4" />
                    Archive
                </button>
                {/* Admin regenerate button */}
                {isAdmin && (
                    <>
                        <button
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className="inline-flex items-center gap-2 bg-none border border-[var(--np-ink)] px-4 py-2 font-inherit text-[0.85rem] cursor-pointer text-[var(--np-ink)] no-underline transition-all duration-200 hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)]"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
                            {isRegenerating ? "Generating..." : "Regenerate"}
                        </button>
                        <button
                            onClick={onShowSettings}
                            className="inline-flex items-center gap-2 bg-none border border-[var(--np-ink)] px-4 py-2 font-inherit text-[0.85rem] cursor-pointer text-[var(--np-ink)] no-underline transition-all duration-200 hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)]"
                        >
                            <Settings2 className="w-4 h-4" />
                            {NEWS_AGENT.personalities.find(p => p.id === selectedPersonality)?.name || "Skye"}
                        </button>
                    </>
                )}
                <a href="/api/news/rss" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-none border border-[var(--np-ink)] px-4 py-2 font-inherit text-[0.85rem] cursor-pointer text-[var(--np-ink)] no-underline transition-all duration-200 hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)]">
                    <Rss className="w-4 h-4" />
                    RSS
                </a>
                <button onClick={onToggleTheme} className="inline-flex items-center gap-2 bg-none border border-[var(--np-ink)] px-4 py-2 font-inherit text-[0.85rem] cursor-pointer text-[var(--np-ink)] no-underline transition-all duration-200 hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)]">
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === "dark" ? "Light Edition" : "Dark Edition"}
                </button>
            </div>
        </header>
    );
}
