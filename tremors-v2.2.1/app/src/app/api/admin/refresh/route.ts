/**
 * Admin API: Refresh Repos, Commits, and Activity from GitHub
 * Fetches all repos, commits, and activity from GitHub and upserts to database
 * Protected: Requires valid admin session cookie + CSRF validation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRepos, getRecentCommits, getActivity } from "@/lib/github";
import { verifyAdminCookie } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { eventToDbActivity } from "@/lib/activity";
import type { GitHubEvent } from "@/types";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "qtremors";

export async function POST(request: NextRequest) {
    // Validate CSRF
    const csrf = validateCsrf(request);
    if (!csrf.valid) {
        return NextResponse.json(
            { success: false, error: csrf.error },
            { status: 403 }
        );
    }

    // Verify admin session
    const isAdmin = await verifyAdminCookie();
    if (!isAdmin) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Fetch repos from GitHub
        const repos = await getRepos(GITHUB_USERNAME);

        // SAFEGUARD: Prevent data loss if GitHub API returns empty/incomplete results
        // This protects against: rate limiting (403), service outages, network failures
        if (repos.length === 0) {
            return NextResponse.json(
                { success: false, error: "GitHub API returned no repos - refusing to sync to prevent data loss" },
                { status: 422 }
            );
        }

        // Fetch commits in parallel with repo processing
        const commits = await getRecentCommits(repos, 50);

        // Use transaction to ensure data integrity (30s timeout for cloud DB)
        await prisma.$transaction(async (tx) => {
            // Get list of current GitHub repo IDs
            const githubRepoIds = repos.map((repo) => repo.id);

            // Delete repos that no longer exist on GitHub
            // Safe because we verified repos.length > 0 above
            await tx.repo.deleteMany({
                where: {
                    id: {
                        notIn: githubRepoIds,
                    },
                },
            });

            // Parallel upsert all repos
            await Promise.all(
                repos.map((repo) =>
                    tx.repo.upsert({
                        where: { id: repo.id },
                        update: {
                            name: repo.name,
                            fullName: repo.full_name,
                            description: repo.description,
                            htmlUrl: repo.html_url,
                            homepage: repo.homepage,
                            stars: repo.stargazers_count,
                            forks: repo.forks_count,
                            language: repo.language,
                            topics: JSON.stringify(repo.topics),
                            pushedAt: new Date(repo.pushed_at),
                            createdAt: new Date(repo.created_at),
                        },
                        create: {
                            id: repo.id,
                            name: repo.name,
                            fullName: repo.full_name,
                            description: repo.description,
                            htmlUrl: repo.html_url,
                            homepage: repo.homepage,
                            stars: repo.stargazers_count,
                            forks: repo.forks_count,
                            language: repo.language,
                            topics: JSON.stringify(repo.topics),
                            pushedAt: new Date(repo.pushed_at),
                            createdAt: new Date(repo.created_at),
                            hidden: false,
                            featured: false,
                        },
                    })
                )
            );

            // Clear old commits and batch insert new ones
            await tx.commit.deleteMany({});

            // Use createMany for batch insert (much faster than individual creates)
            await tx.commit.createMany({
                data: commits.map((commit) => ({
                    sha: commit.sha,
                    message: commit.message,
                    date: new Date(commit.date),
                    repoName: commit.repoName,
                    repoUrl: commit.repoUrl,
                    author: commit.author,
                })),
            });

            // Cache activity events using shared utility
            const events = await getActivity(GITHUB_USERNAME, 30);
            await tx.activity.deleteMany({});

            // Convert events to activity items using shared utility
            const activityData = events
                .filter((e: GitHubEvent) => e.type !== "PushEvent")
                .map((event: GitHubEvent) => eventToDbActivity(event))
                .filter((item): item is NonNullable<typeof item> => item !== null);

            if (activityData.length > 0) {
                await tx.activity.createMany({ data: activityData });
            }

            // Update last refresh timestamp
            await tx.settings.upsert({
                where: { id: "main" },
                update: { lastRefresh: new Date() },
                create: { id: "main", lastRefresh: new Date() },
            });
        }, {
            maxWait: 10000,  // Max time to wait for a transaction slot (10s)
            timeout: 30000, // Max time for the transaction to complete (30s)
        });

        return NextResponse.json({
            success: true,
            count: repos.length,
            commits: commits.length,
            message: `Synced ${repos.length} repos and ${commits.length} commits from GitHub`,
        });
    } catch (error) {
        console.error("Refresh error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to refresh repos" },
            { status: 500 }
        );
    }
}
