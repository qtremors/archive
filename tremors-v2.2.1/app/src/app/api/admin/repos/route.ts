/**
 * Admin API: Manage Repos
 * GET - List all repos with admin status
 * PATCH - Update repo visibility/featured status
 * Protected: Requires valid admin session cookie + CSRF validation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminCookie } from "@/lib/auth";
import { parseTopics } from "@/lib/utils";
import { validateCsrf } from "@/lib/csrf";

// GET all repos (for admin panel)
export async function GET() {
    // Verify admin session
    const isAdmin = await verifyAdminCookie();
    if (!isAdmin) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const repos = await prisma.repo.findMany({
            orderBy: [
                { featured: "desc" },
                { order: "asc" },
                { stars: "desc" },
            ],
        });

        // Parse topics JSON and add html_url for each repo
        const reposWithTopics = repos.map((repo) => ({
            ...repo,
            topics: parseTopics(repo.topics),
            html_url: repo.htmlUrl, // Frontend expects snake_case
        }));

        return NextResponse.json({
            success: true,
            repos: reposWithTopics,
        });
    } catch (error) {
        console.error("Get repos error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch repos" },
            { status: 500 }
        );
    }
}

// PATCH - Update repo settings
export async function PATCH(request: NextRequest) {
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
        const body = await request.json();
        const { id, hidden, featured, order, customName, customDescription, imageSource, customImageUrl } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Repo ID required" },
                { status: 400 }
            );
        }

        // Validate imageSource if provided
        if (imageSource !== undefined && !["github", "custom", "none", null].includes(imageSource)) {
            return NextResponse.json(
                { success: false, error: "imageSource must be 'github', 'custom', or 'none'" },
                { status: 400 }
            );
        }

        // Validate customImageUrl format if provided
        if (customImageUrl !== undefined && customImageUrl !== null && customImageUrl.trim() !== "") {
            // Allow relative URLs starting with /
            if (!customImageUrl.startsWith("/")) {
                try {
                    new URL(customImageUrl);
                } catch {
                    return NextResponse.json(
                        { success: false, error: "customImageUrl must be a valid URL or start with /" },
                        { status: 400 }
                    );
                }
            }
        }

        const updateData: Record<string, unknown> = {};
        if (hidden !== undefined) updateData.hidden = hidden;
        if (featured !== undefined) updateData.featured = featured;
        if (order !== undefined) updateData.order = order;
        if (customName !== undefined) updateData.customName = customName;
        if (customDescription !== undefined) updateData.customDescription = customDescription;
        if (imageSource !== undefined) updateData.imageSource = imageSource;
        if (customImageUrl !== undefined) updateData.customImageUrl = customImageUrl;

        const repo = await prisma.repo.update({
            where: { id: Number(id) },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            repo: {
                ...repo,
                topics: parseTopics(repo.topics),
            },
        });
    } catch (error) {
        console.error("Update repo error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update repo" },
            { status: 500 }
        );
    }
}
