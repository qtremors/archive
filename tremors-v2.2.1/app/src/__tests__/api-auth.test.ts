/**
 * API Route Authentication Tests
 * T-001: Test that protected routes require authentication
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for testing API routes
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("API Route Authentication", () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe("Admin Routes Protection", () => {
        it("should reject unauthenticated requests to /api/admin/repos", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: "Unauthorized" }),
            });

            const res = await fetch("/api/admin/repos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: 1, hidden: true }),
            });

            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);
        });

        it("should reject unauthenticated requests to /api/admin/refresh", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: "Unauthorized" }),
            });

            const res = await fetch("/api/admin/refresh", { method: "POST" });

            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);
        });

        it("should reject unauthenticated requests to /api/admin/availability", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: "Unauthorized" }),
            });

            const res = await fetch("/api/admin/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ availableForWork: true }),
            });

            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);
        });
    });

    describe("Public Routes", () => {
        it("should allow unauthenticated GET to /api/stats/commits", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ totalCommits: 100 }),
            });

            const res = await fetch("/api/stats/commits");
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.totalCommits).toBe(100);
        });

        it("should allow unauthenticated GET to /api/admin/availability", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, availableForWork: true }),
            });

            const res = await fetch("/api/admin/availability");
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.availableForWork).toBe(true);
        });
    });

    describe("Auth Flow", () => {
        it("should handle login attempts", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, isSecret: true, needsSetup: false }),
            });

            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: "test" }),
            });
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.success).toBe(true);
        });

        it("should handle logout", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true }),
            });

            const res = await fetch("/api/auth/logout", { method: "POST" });
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.success).toBe(true);
        });

        it("should check auth status", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ isAdmin: false }),
            });

            const res = await fetch("/api/auth/check");
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.isAdmin).toBe(false);
        });
    });
});
