/**
 * ActivityTicker - Scrolling marquee of recent GitHub activity
 */

"use client";

import { GitCommit, Star, GitBranch, GitPullRequest, Rocket } from "lucide-react";

interface ActivityItem {
    type: string;
    repoName: string;
    title: string;
}

interface ActivityTickerProps {
    activity: ActivityItem[];
}

export function ActivityTicker({ activity }: ActivityTickerProps) {
    if (activity.length === 0) return null;

    // Duplicate for seamless loop - show 10 items
    const items = [...activity.slice(0, 10), ...activity.slice(0, 10)];

    const IconMap: Record<string, typeof GitCommit> = {
        commit: GitCommit,
        star: Star,
        create: GitBranch,
        pr: GitPullRequest,
        release: Rocket,
        fork: GitBranch,
    };

    return (
        <div className="bg-[var(--np-ink)] text-[var(--np-paper)] py-3 mx-[-24px] md:mx-[-60px] my-8 overflow-hidden font-mono text-[0.8rem]">
            <div className="flex whitespace-nowrap animate-np-ticker w-max hover:[animation-play-state:paused]">
                {items.map((item, i) => {
                    const Icon = IconMap[item.type] || GitCommit;
                    return (
                        <span key={i} className="px-12 shrink-0">
                            <Icon className="w-3 h-3 inline" />{" "}
                            <span className="text-[var(--np-accent)]">{item.repoName}</span>: {item.title}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
