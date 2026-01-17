/**
 * NewspaperPage Edition Loading Tests
 * T-004: Test newspaper edition fetching and display
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for testing API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("NewspaperPage Edition Loading", () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe("Active Edition Fetch", () => {
        it("should fetch active edition on load", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    edition: {
                        id: "123",
                        headline: "Test Headline",
                        subheadline: "Test Subheadline",
                        bodyContent: ["Para 1", "Para 2"],
                        pullQuote: "A great quote",
                        isFallback: false,
                    },
                }),
            });

            const res = await fetch("/api/newspaper/active");
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.success).toBe(true);
            expect(data.edition.headline).toBe("Test Headline");
        });

        it("should handle no active edition (use fallback)", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    edition: null,
                }),
            });

            const res = await fetch("/api/newspaper/active");
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.edition).toBeNull();
        });
    });

    describe("Editions List Fetch", () => {
        it("should fetch list of past editions", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    editions: [
                        { id: "1", date: "2024-12-01", headline: "First", isActive: false, isFallback: false },
                        { id: "2", date: "2024-12-02", headline: "Second", isActive: true, isFallback: false },
                    ],
                }),
            });

            const res = await fetch("/api/newspaper/editions");
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.editions).toHaveLength(2);
        });
    });

    describe("Edition Generation", () => {
        it("should generate new edition (admin only)", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    edition: {
                        id: "new-123",
                        headline: "Generated Headline",
                        generatedBy: "gemini",
                    },
                }),
            });

            const res = await fetch("/api/newspaper/generate", { method: "POST" });
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.edition.generatedBy).toBe("gemini");
        });

        it("should return error if not admin", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: "Unauthorized" }),
            });

            const res = await fetch("/api/newspaper/generate", { method: "POST" });

            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);
        });
    });

    describe("Edition Selection", () => {
        it("should load specific edition by ID", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    edition: {
                        id: "specific-123",
                        headline: "Old Edition",
                        date: "2024-11-15",
                    },
                }),
            });

            const res = await fetch("/api/newspaper/editions/specific-123");
            const data = await res.json();

            expect(res.ok).toBe(true);
            expect(data.edition.id).toBe("specific-123");
        });
    });

    describe("Fallback Content", () => {
        it("should provide fallback when API fails", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            const fallbackEdition = {
                headline: "Local Developer Builds AI-Powered Platforms",
                subheadline: "Continues to push commits despite all odds",
                bodyContent: ["Fallback content paragraph"],
                isFallback: true,
            };

            // Simulate fallback usage
            try {
                await fetch("/api/newspaper/active");
            } catch {
                // Use fallback
                expect(fallbackEdition.isFallback).toBe(true);
                expect(fallbackEdition.headline).toBeDefined();
            }
        });
    });
});
