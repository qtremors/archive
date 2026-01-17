/**
 * NewspaperStats - Statistics row for Newspaper mode
 */

"use client";

import { Loader2 } from "lucide-react";

interface NewspaperStatsProps {
    repoCount: number;
    totalCommits: number | null;
    isLoadingCommits: boolean;
}

export function NewspaperStats({ repoCount, totalCommits, isLoadingCommits }: NewspaperStatsProps) {
    return (
        <div className="flex justify-center gap-[40px] md:gap-[80px] my-10 py-8 border-y-2 border-[var(--np-ink)] flex-wrap md:flex-nowrap">
            <div className="text-center">
                <div className="font-display text-[2.5rem] font-bold text-[var(--np-accent)]">{repoCount}</div>
                <div className="text-[0.75rem] uppercase tracking-[2px] text-[var(--np-ink-light)]">Public Repos</div>
            </div>
            <div className="text-center">
                <div className="font-display text-[2.5rem] font-bold text-[var(--np-accent)]">
                    {isLoadingCommits ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                    ) : (
                        totalCommits ?? "—"
                    )}
                </div>
                <div className="text-[0.75rem] uppercase tracking-[2px] text-[var(--np-ink-light)]">Total Commits</div>
            </div>
        </div>
    );
}
