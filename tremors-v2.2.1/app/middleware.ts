/**
 * Next.js Middleware
 * Provides centralized rate limiting and request validation
 */

import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiting store
// Note: In production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration by route pattern
const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
    "/api/auth": { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 min
    "/api/admin": { requests: 30, windowMs: 60 * 1000 }, // 30 requests per min
    "/api/newspaper/generate": { requests: 10, windowMs: 60 * 1000 }, // 10 per min
    default: { requests: 100, windowMs: 60 * 1000 }, // 100 per min
};

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const ip = request.headers.get("x-real-ip");
    if (ip) return ip;
    // Fallback fingerprint
    const ua = request.headers.get("user-agent") || "";
    return `anon-${ua.slice(0, 30)}`;
}

function getRateLimitConfig(pathname: string): { requests: number; windowMs: number } {
    for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
        if (pattern !== "default" && pathname.startsWith(pattern)) {
            return config;
        }
    }
    return RATE_LIMITS.default;
}

function checkRateLimit(key: string, config: { requests: number; windowMs: number }): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
} {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        for (const [k, v] of rateLimitStore.entries()) {
            if (now > v.resetTime) rateLimitStore.delete(k);
        }
    }

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
        return { allowed: true, remaining: config.requests - 1, resetTime: now + config.windowMs };
    }

    if (record.count >= config.requests) {
        return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { allowed: true, remaining: config.requests - record.count, resetTime: record.resetTime };
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only rate limit API routes
    if (!pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // Skip rate limiting for safe methods on non-auth routes
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(request.method) && !pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const ip = getClientIP(request);
    const config = getRateLimitConfig(pathname);
    const key = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;

    const { allowed, remaining, resetTime } = checkRateLimit(key, config);

    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": config.requests.toString(),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
                    "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
                },
            }
        );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", config.requests.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", Math.ceil(resetTime / 1000).toString());

    return response;
}

export const config = {
    matcher: ["/api/:path*"],
};
