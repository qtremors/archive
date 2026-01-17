/**
 * ActivitySection - Recent activity with "Show More" progressive reveal
 */

"use client";

import { useState } from "react";
import type { ActivityItem } from "@/types";
import { GitCommit, Plus, Tag, GitPullRequest, Star, GitFork, ChevronDown } from "lucide-react";

interface ActivitySectionProps {
    activity: ActivityItem[];
}

const ITEMS_PER_PAGE = 10;

function getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function getActivityIcon(type: ActivityItem['type']) {
    switch (type) {
        case 'commit':
            return { icon: GitCommit, color: 'text-green-400', bg: 'bg-green-500/20' };
        case 'create':
            return { icon: Plus, color: 'text-blue-400', bg: 'bg-blue-500/20' };
        case 'release':
            return { icon: Tag, color: 'text-purple-400', bg: 'bg-purple-500/20' };
        case 'pr':
            return { icon: GitPullRequest, color: 'text-orange-400', bg: 'bg-orange-500/20' };
        case 'star':
            return { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        case 'fork':
            return { icon: GitFork, color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
        default:
            return { icon: GitCommit, color: 'text-green-400', bg: 'bg-green-500/20' };
    }
}

export function ActivitySection({ activity }: ActivitySectionProps) {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    if (!activity || activity.length === 0) {
        return (
            <section id="activity" className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl font-bold">Recent Activity</h2>
                    <span className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <p className="text-[var(--text-muted)]">No recent activity to display</p>
            </section>
        );
    }

    const visibleItems = activity.slice(0, visibleCount);
    const hasMore = visibleCount < activity.length;
    const remainingCount = activity.length - visibleCount;

    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, activity.length));
    };

    return (
        <section id="activity" className="mb-24">
            <div className="flex items-center gap-4 mb-10">
                <h2 className="text-3xl font-bold">Recent Activity</h2>
                <span className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-sm text-[var(--text-muted)]">
                    {visibleCount} of {activity.length}
                </span>
            </div>

            {/* 2-Column Activity Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {visibleItems.map((item, index) => {
                    const { icon: Icon, color, bg } = getActivityIcon(item.type);
                    // Add animation delay for newly revealed items
                    const isNewlyRevealed = index >= visibleCount - ITEMS_PER_PAGE && visibleCount > ITEMS_PER_PAGE;
                    return (
                        <a
                            key={item.id}
                            href={item.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group flex gap-4 p-4 rounded-xl bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] hover:border-[var(--accent-cyan)]/50 hover:-translate-y-0.5 transition-all ${isNewlyRevealed ? 'animate-fade-in' : ''
                                }`}
                            style={isNewlyRevealed ? { animationDelay: `${(index % ITEMS_PER_PAGE) * 50}ms` } : undefined}
                        >
                            {/* Activity icon */}
                            <div className="shrink-0">
                                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="font-medium line-clamp-1 group-hover:text-[var(--accent-cyan)] transition-colors">
                                        {item.title}
                                    </p>
                                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap shrink-0">
                                        {getRelativeTime(item.date)}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--accent-cyan)]">
                                    {item.repoName}
                                </p>
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* Show More/Less Buttons */}
            {activity.length > ITEMS_PER_PAGE && (
                <div className="mt-6 flex justify-center gap-3">
                    {/* Show Less - only when expanded beyond initial */}
                    {visibleCount > ITEMS_PER_PAGE && (
                        <button
                            onClick={() => setVisibleCount(prev => Math.max(prev - ITEMS_PER_PAGE, ITEMS_PER_PAGE))}
                            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/5 transition-all"
                        >
                            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] rotate-180 transition-transform group-hover:-translate-y-0.5" />
                            <span className="text-xs text-[var(--text-muted)]">
                                -{Math.min(ITEMS_PER_PAGE, visibleCount - ITEMS_PER_PAGE)}
                            </span>
                            <span className="text-[var(--text-muted)] group-hover:text-[var(--text)]">
                                Show Less
                            </span>
                        </button>
                    )}
                    {/* Show More - only when more to show */}
                    {hasMore && (
                        <button
                            onClick={handleShowMore}
                            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/5 transition-all"
                        >
                            <span className="text-[var(--text-muted)] group-hover:text-[var(--text)]">
                                Show More
                            </span>
                            <span className="text-xs text-[var(--accent-cyan)]">
                                +{Math.min(ITEMS_PER_PAGE, remainingCount)}
                            </span>
                            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] transition-transform group-hover:translate-y-0.5" />
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
