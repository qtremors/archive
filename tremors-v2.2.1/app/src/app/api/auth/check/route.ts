import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";

/**
 * Auth Check API Route
 * Verifies if current session has admin privileges
 * 
 * GET /api/auth/check
 * Returns: { isAdmin: boolean }
 */

export async function GET() {
    try {
        const isAdmin = await verifyAdminCookie();
        return NextResponse.json({ isAdmin });
    } catch {
        return NextResponse.json({ isAdmin: false });
    }
}
