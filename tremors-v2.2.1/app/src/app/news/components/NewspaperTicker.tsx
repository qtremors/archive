/**
 * NewspaperTicker - Scrolling activity ticker for newspaper mode
 * A-001: Extracted from NewspaperPage.tsx
 */

"use client";

import { GitCommit, Star, GitBranch, GitPullRequest, Rocket } from "lucide-react";
import type { GitHubEvent } from "@/types";

interface TickerProps {
    activity: GitHubEvent[];
}

// Event type icons
const EVENT_ICONS: Record<string, React.ElementType> = {
    PushEvent: GitCommit,
    CreateEvent: GitBranch,
    WatchEvent: Star,
    PullRequestEvent: GitPullRequest,
    ReleaseEvent: Rocket,
};

// Format activity for display
function formatEvent(event: GitHubEvent): string {
    const repo = event.repo.name.split("/")[1] || event.repo.name;
    const payload = event.payload as Record<string, unknown>;
    switch (event.type) {
        case "PushEvent":
            return `Pushed ${payload?.commits ? (payload.commits as unknown[]).length : 1} commit(s) to ${repo}`;
        case "CreateEvent":
            return `Created ${event.payload?.ref_type || "branch"} in ${repo}`;
        case "WatchEvent":
            return `Starred ${repo}`;
        case "PullRequestEvent":
            return `${event.payload?.action || ""} PR in ${repo}`;
        case "ReleaseEvent":
            return `Released new version in ${repo}`;
        default:
            return `Activity in ${repo}`;
    }
}

export function NewspaperTicker({ activity }: TickerProps) {
    if (!activity.length) return null;

    return (
        <div className="np-ticker">
            <div className="np-ticker-label">LATEST</div>
            <div className="np-ticker-track">
                <div className="np-ticker-content">
                    {activity.slice(0, 10).map((event, i) => {
                        const Icon = EVENT_ICONS[event.type] || GitCommit;
                        return (
                            <span key={`${event.id}-${i}`} className="np-ticker-item">
                                <Icon className="w-3 h-3" />
                                {formatEvent(event)}
                            </span>
                        );
                    })}
                    {/* Duplicate for seamless loop */}
                    {activity.slice(0, 10).map((event, i) => {
                        const Icon = EVENT_ICONS[event.type] || GitCommit;
                        return (
                            <span key={`${event.id}-${i}-dup`} className="np-ticker-item">
                                <Icon className="w-3 h-3" />
                                {formatEvent(event)}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
