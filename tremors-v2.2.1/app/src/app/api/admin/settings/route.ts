/**
 * Admin API: Site Settings
 * GET - Get current settings
 * PATCH - Update settings (showProjectImages, availableForWork)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminCookie } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";

// GET settings (public for showProjectImages, admin for full)
export async function GET() {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: "main" },
        });

        if (!settings) {
            // Return defaults if no settings exist
            return NextResponse.json({
                success: true,
                settings: {
                    showProjectImages: true,
                    availableForWork: true,
                    projectViewMode: "grid",
                },
            });
        }

        return NextResponse.json({
            success: true,
            settings: {
                showProjectImages: settings.showProjectImages,
                availableForWork: settings.availableForWork,
                projectViewMode: settings.projectViewMode,
                lastRefresh: settings.lastRefresh,
                resumeSummary: settings.resumeSummary,
                resumeAbout: settings.resumeAbout,
            },
        });
    } catch (error) {
        console.error("Get settings error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

// PATCH - Update settings (admin only)
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
        const { showProjectImages, availableForWork, projectViewMode, resumeSummary, resumeAbout } = body;

        // Validate projectViewMode if provided
        if (projectViewMode !== undefined) {
            const normalized = String(projectViewMode).toLowerCase();
            if (normalized !== "grid" && normalized !== "list") {
                return NextResponse.json(
                    { success: false, error: "projectViewMode must be 'grid' or 'list'" },
                    { status: 400 }
                );
            }
        }

        const updateData: Record<string, unknown> = {};
        if (showProjectImages !== undefined) updateData.showProjectImages = showProjectImages;
        if (availableForWork !== undefined) updateData.availableForWork = availableForWork;
        if (projectViewMode !== undefined) updateData.projectViewMode = String(projectViewMode).toLowerCase();
        if (resumeSummary !== undefined) updateData.resumeSummary = resumeSummary;
        if (resumeAbout !== undefined) updateData.resumeAbout = resumeAbout;

        const settings = await prisma.settings.upsert({
            where: { id: "main" },
            update: updateData,
            create: {
                id: "main",
                showProjectImages: showProjectImages ?? true,
                availableForWork: availableForWork ?? true,
            },
        });

        return NextResponse.json({
            success: true,
            settings: {
                showProjectImages: settings.showProjectImages,
                availableForWork: settings.availableForWork,
                projectViewMode: settings.projectViewMode,
                resumeSummary: settings.resumeSummary,
                resumeAbout: settings.resumeAbout,
            },
        });
    } catch (error) {
        console.error("Update settings error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
