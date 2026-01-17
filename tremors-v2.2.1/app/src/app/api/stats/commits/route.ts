/**
 * API Route: /api/stats/commits
 * Fetches total commit count across all repos from GitHub API
 * Uses pagination Link header trick to get total without fetching all commits
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "qtremors";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "tremors-portfolio",
    };
    if (GITHUB_TOKEN) {
        headers.Authorization = `token ${GITHUB_TOKEN}`;
    }
    return headers;
}

/**
 * Fetches the total commit count for a single repo using Link header pagination trick
 */
async function fetchCommitCount(owner: string, repoName: string): Promise<number> {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repoName}/commits?per_page=1`;
    try {
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            if (response.status === 409) return 0; // 409 Conflict = Empty repo
            throw new Error(`API Error: ${response.status} for ${repoName}`);
        }

        // GitHub returns total page count in Link header
        const linkHeader = response.headers.get("Link");
        if (linkHeader) {
            const lastLink = linkHeader.split(",").find((s) => s.includes('rel="last"'));
            if (lastLink) {
                const match = lastLink.match(/<.*?[?&]page=(\d+).*?>/);
                if (match && match[1]) {
                    return parseInt(match[1], 10);
                }
            }
        }

        // Fallback: count commits in response
        const data = await response.json();
        return Array.isArray(data) ? data.length : 0;
    } catch (error) {
        console.error(`Failed to fetch commits for ${repoName}:`, error);
        return 0;
    }
}

export async function GET() {
    try {
        // Get ALL repos from database (including hidden) for accurate commit count
        const repos = await prisma.repo.findMany({
            select: { name: true },
        });

        if (repos.length === 0) {
            return NextResponse.json({ totalCommits: 0, repos: [] });
        }

        // Fetch commit counts for all repos in parallel
        const results = await Promise.allSettled(
            repos.map(async (repo: { name: string }) => {
                const count = await fetchCommitCount(GITHUB_USERNAME, repo.name);
                return { name: repo.name, count };
            })
        );

        // Aggregate results
        let totalCommits = 0;
        const repoStats: Array<{ name: string; count: number }> = [];

        for (const result of results) {
            if (result.status === "fulfilled") {
                totalCommits += result.value.count;
                repoStats.push(result.value);
            }
        }

        const response = NextResponse.json({
            totalCommits,
            repos: repoStats,
            fetchedAt: new Date().toISOString(),
        });

        // Cache for 5 minutes on CDN, 1 minute stale-while-revalidate
        response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
        return response;
    } catch (error) {
        console.error("Failed to fetch commit stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch commit stats", totalCommits: 0 },
            { status: 500 }
        );
    }
}
