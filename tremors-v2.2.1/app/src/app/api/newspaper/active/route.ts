/**
 * API Route: /api/newspaper/active
 * Set which edition is active for a given day (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminCookie } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getStartOfDayIST, getEndOfDayIST } from "@/lib/date";

/**
 * POST: Set an edition as active (deactivates others for same day)
 * Body: { editionId: string }
 */
export async function POST(request: NextRequest) {
    try {
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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { editionId } = await request.json();
        if (!editionId) {
            return NextResponse.json({ error: "editionId required" }, { status: 400 });
        }

        // Get the edition to find its date
        const edition = await prisma.newspaperEdition.findUnique({
            where: { id: editionId },
        });

        if (!edition) {
            return NextResponse.json({ success: false, error: "Edition not found" }, { status: 404 });
        }

        // Get start and end of that day in IST
        const dayStart = getStartOfDayIST(new Date(edition.date));
        const dayEnd = getEndOfDayIST(new Date(edition.date));

        // Deactivate all editions for that day
        await prisma.newspaperEdition.updateMany({
            where: {
                date: { gte: dayStart, lte: dayEnd },
            },
            data: { isActive: false },
        });

        // Activate the selected one
        const updated = await prisma.newspaperEdition.update({
            where: { id: editionId },
            data: { isActive: true },
        });

        return NextResponse.json({
            success: true,
            edition: {
                ...updated,
                bodyContent: JSON.parse(updated.bodyContent),
            },
        });
    } catch (error) {
        console.error("Set active edition error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to set active edition" },
            { status: 500 }
        );
    }
}
