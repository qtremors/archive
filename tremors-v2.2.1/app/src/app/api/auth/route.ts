/**
 * Auth API Route
 * Handles admin authentication with multiple actions
 *
 * POST /api/auth
 * Actions:
 *   - { action: "check" } - Check if admin account exists
 *   - { action: "setup", password, confirmPassword } - Create admin account
 *   - { action: "login", password } - Login with password
 *   - { action: "changePassword", currentPassword, newPassword } - Change password
 */

import { NextRequest, NextResponse } from "next/server";
import {
    adminExists,
    createAdmin,
    verifyAdminPassword,
    changeAdminPassword,
    setAdminCookie,
    verifyAdminCookie,
    getSessionInfo,
} from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";

// Simple in-memory rate limiting with cleanup
const attempts = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes
let lastCleanup = Date.now();

function getClientIP(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    // Fallback: use a combination of user-agent and accept-language for some isolation
    const ua = request.headers.get("user-agent") || "";
    const lang = request.headers.get("accept-language") || "";
    return `anon-${(ua + lang).slice(0, 50)}`;
}

// Clean up expired rate limit entries to prevent memory leak
function cleanupExpiredEntries(): void {
    const now = Date.now();
    // Only cleanup periodically, not on every request
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;
    for (const [ip, record] of attempts.entries()) {
        if (now - record.firstAttempt > RATE_WINDOW) {
            attempts.delete(ip);
        }
    }
}

function checkRateLimit(ip: string): boolean {
    const now = Date.now();

    // Always clean up expired entries before checking
    cleanupExpiredEntries();

    const record = attempts.get(ip);

    if (!record || now - record.firstAttempt > RATE_WINDOW) {
        attempts.set(ip, { count: 1, firstAttempt: now });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

function clearRateLimit(ip: string): void {
    attempts.delete(ip);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;
        const ip = getClientIP(request);

        // Check if admin account exists (read-only, skip CSRF)
        if (action === "check") {
            const exists = await adminExists();
            const isLoggedIn = await verifyAdminCookie();
            const sessionInfo = isLoggedIn ? await getSessionInfo() : null;

            return NextResponse.json({
                success: true,
                exists,
                isLoggedIn,
                sessionInfo,
            });
        }

        // Validate CSRF for all mutating actions
        const csrf = validateCsrf(request);
        if (!csrf.valid) {
            return NextResponse.json(
                { success: false, error: csrf.error },
                { status: 403 }
            );
        }

        // Setup new admin account
        if (action === "setup") {
            const { password, confirmPassword } = body;

            // Validate
            if (!password || password.length < 8) {
                return NextResponse.json(
                    { success: false, error: "Password must be at least 8 characters" },
                    { status: 400 }
                );
            }

            if (password !== confirmPassword) {
                return NextResponse.json(
                    { success: false, error: "Passwords do not match" },
                    { status: 400 }
                );
            }

            const exists = await adminExists();
            if (exists) {
                return NextResponse.json(
                    { success: false, error: "Admin account already exists" },
                    { status: 400 }
                );
            }

            await createAdmin(password);
            await setAdminCookie();
            clearRateLimit(ip);

            return NextResponse.json({
                success: true,
                message: "Admin account created successfully",
            });
        }

        // Login with password
        if (action === "login") {
            // Check rate limit
            if (!checkRateLimit(ip)) {
                return NextResponse.json(
                    { success: false, error: "Too many attempts. Try again later." },
                    { status: 429 }
                );
            }

            const { password } = body;

            if (!password) {
                return NextResponse.json(
                    { success: false, error: "Password required" },
                    { status: 400 }
                );
            }

            const exists = await adminExists();
            if (!exists) {
                return NextResponse.json(
                    { success: false, error: "No admin account exists", needsSetup: true },
                    { status: 400 }
                );
            }

            const isValid = await verifyAdminPassword(password);
            if (!isValid) {
                return NextResponse.json(
                    { success: false, error: "Invalid password" },
                    { status: 401 }
                );
            }

            await setAdminCookie();
            clearRateLimit(ip);

            return NextResponse.json({
                success: true,
                message: "Authentication successful",
            });
        }

        // Change password
        if (action === "changePassword") {
            const isLoggedIn = await verifyAdminCookie();
            if (!isLoggedIn) {
                return NextResponse.json(
                    { success: false, error: "Not authenticated" },
                    { status: 401 }
                );
            }

            const { currentPassword, newPassword } = body;

            if (!currentPassword || !newPassword) {
                return NextResponse.json(
                    { success: false, error: "Both passwords required" },
                    { status: 400 }
                );
            }

            if (newPassword.length < 8) {
                return NextResponse.json(
                    { success: false, error: "New password must be at least 8 characters" },
                    { status: 400 }
                );
            }

            const changed = await changeAdminPassword(currentPassword, newPassword);
            if (!changed) {
                return NextResponse.json(
                    { success: false, error: "Current password is incorrect" },
                    { status: 401 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Password changed successfully",
            });
        }

        // Legacy support: Check if username matches secret (for terminal trigger)
        const { username, password } = body;
        const adminSecret = process.env.ADMIN_SECRET;

        if (username && !password) {
            // Check if this is the secret command trigger
            if (adminSecret && username === adminSecret) {
                const exists = await adminExists();
                const isLoggedIn = await verifyAdminCookie();

                return NextResponse.json({
                    success: true,
                    isSecret: true,
                    needsSetup: !exists,
                    isLoggedIn,
                });
            }
            return NextResponse.json({ success: false });
        }

        return NextResponse.json(
            { success: false, error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
