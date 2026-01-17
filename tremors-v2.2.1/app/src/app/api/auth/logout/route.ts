import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";

/**
 * Logout API Route
 * Clears admin session cookie
 * 
 * POST /api/auth/logout
 * Returns: { success: boolean }
 */

export async function POST(request: NextRequest) {
    // Validate CSRF
    const csrf = validateCsrf(request);
    if (!csrf.valid) {
        return NextResponse.json(
            { success: false, error: csrf.error },
            { status: 403 }
        );
    }

    try {
        await clearAdminCookie();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to logout" },
            { status: 500 }
        );
    }
}
