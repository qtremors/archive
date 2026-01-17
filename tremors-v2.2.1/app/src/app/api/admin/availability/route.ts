/**
 * Admin API: Toggle Availability Status
 * Protected: Requires valid admin session cookie + CSRF validation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminCookie } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";

// GET: Get current availability status (public)
export async function GET() {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: "main" },
        });
        return NextResponse.json({
            success: true,
            availableForWork: settings?.availableForWork ?? true,
        });
    } catch (error) {
        console.error("Settings fetch error:", error);
        return NextResponse.json(
            { success: false, availableForWork: true },
            { status: 500 }
        );
    }
}

// POST: Toggle availability (admin only)
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
        const body = await request.json();
        const { availableForWork } = body;

        if (typeof availableForWork !== "boolean") {
            return NextResponse.json(
                { success: false, error: "Invalid value" },
                { status: 400 }
            );
        }

        await prisma.settings.upsert({
            where: { id: "main" },
            update: { availableForWork },
            create: { id: "main", availableForWork },
        });

        return NextResponse.json({
            success: true,
            availableForWork,
            message: `Availability set to ${availableForWork}`,
        });
    } catch (error) {
        console.error("Settings update error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update" },
            { status: 500 }
        );
    }
}
