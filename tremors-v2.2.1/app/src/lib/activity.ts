/**
 * Activity Conversion Utilities
 * A-003: Shared logic for converting GitHub events to activity items
 */

import type { GitHubEvent, ActivityItem } from "@/types";

/**
 * Convert a GitHub event to an ActivityItem
 * Returns null for unsupported event types
 */
export function eventToActivityItem(event: GitHubEvent): ActivityItem | null {
    const repoName = event.repo.name.split("/")[1] || event.repo.name;
    const repoUrl = `https://github.com/${event.repo.name}`;

    switch (event.type) {
        case "CreateEvent":
            return {
                id: event.id,
                type: "create",
                title: `Created ${event.payload.ref_type || "repository"}${event.payload.ref ? ` "${event.payload.ref}"` : ""}`,
                repoName,
                repoUrl,
                date: event.created_at,
            };
        case "ReleaseEvent":
            return {
                id: event.id,
                type: "release",
                title: `Released ${event.payload.action || "version"}`,
                repoName,
                repoUrl,
                date: event.created_at,
            };
        case "PullRequestEvent":
            return {
                id: event.id,
                type: "pr",
                title: `${event.payload.action || "Opened"} pull request`,
                repoName,
                repoUrl,
                date: event.created_at,
            };
        case "WatchEvent":
            return {
                id: event.id,
                type: "star",
                title: "Starred repository",
                repoName,
                repoUrl,
                date: event.created_at,
            };
        case "ForkEvent":
            return {
                id: event.id,
                type: "fork",
                title: "Forked repository",
                repoName,
                repoUrl,
                date: event.created_at,
            };
        default:
            return null;
    }
}

/**
 * Convert a GitHub event to a database-ready activity record
 * Used for caching activity in the database during refresh
 */
export function eventToDbActivity(event: GitHubEvent): {
    id: string;
    type: string;
    title: string;
    repoName: string;
    repoUrl: string;
    date: Date;
} | null {
    const item = eventToActivityItem(event);
    if (!item) return null;

    return {
        id: item.id,
        type: item.type,
        title: item.title,
        repoName: item.repoName,
        repoUrl: item.repoUrl,
        date: new Date(item.date),
    };
}
