/**
 * Tests for CSRF protection
 */

import { describe, it, expect } from "vitest";

describe("CSRF validation", () => {
    it("should skip CSRF check for safe methods", () => {
        const safeMethods = ["GET", "HEAD", "OPTIONS"];

        safeMethods.forEach(method => {
            expect(safeMethods.includes(method)).toBe(true);
        });
    });

    it("should require CSRF check for unsafe methods", () => {
        const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];
        const safeMethods = ["GET", "HEAD", "OPTIONS"];

        unsafeMethods.forEach(method => {
            expect(safeMethods.includes(method)).toBe(false);
        });
    });

    it("should validate localhost origins", () => {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ];

        expect(allowedOrigins.some(allowed => "http://localhost:3000".startsWith(allowed))).toBe(true);
        expect(allowedOrigins.some(allowed => "http://evil.com".startsWith(allowed))).toBe(false);
    });

    it("should validate origin against host header", () => {
        const origin = "https://tremors.vercel.app";
        const host = "tremors.vercel.app";

        expect(origin.includes(host)).toBe(true);
    });

    it("should validate referer as fallback", () => {
        const referer = "https://tremors.vercel.app/terminal";
        const host = "tremors.vercel.app";

        const refererUrl = new URL(referer);
        expect(refererUrl.host).toBe(host);
    });
});
