/**
 * CSRF Protection Utilities
 * Validates origin and referer headers for API routes
 */

import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];

// Add production domains if set
if (process.env.NEXT_PUBLIC_URL) {
    ALLOWED_ORIGINS.push(process.env.NEXT_PUBLIC_URL);
}
if (process.env.NEXT_PUBLIC_SITE_URL) {
    ALLOWED_ORIGINS.push(process.env.NEXT_PUBLIC_SITE_URL);
}
// Vercel deployment URL (auto-set by Vercel)
if (process.env.VERCEL_URL) {
    ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_URL}`);
}
// Vercel production URL
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
}

export function validateCsrf(request: NextRequest): { valid: boolean; error?: string } {
    // Skip CSRF check for safe methods
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(request.method)) {
        return { valid: true };
    }

    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    // Must have either origin or referer
    if (!origin && !referer) {
        return { valid: false, error: "Missing origin or referer header" };
    }

    // Check origin
    if (origin) {
        if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
            return { valid: true };
        }
        // Allow same-origin
        const host = request.headers.get("host");
        if (host && origin.includes(host)) {
            return { valid: true };
        }
    }

    // Check referer as fallback
    if (referer) {
        const refererUrl = new URL(referer);
        if (ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
            return { valid: true };
        }
        const host = request.headers.get("host");
        if (host && refererUrl.host === host) {
            return { valid: true };
        }
    }

    return { valid: false, error: "Invalid origin" };
}
