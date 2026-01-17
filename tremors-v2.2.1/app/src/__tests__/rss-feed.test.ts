/**
 * RSS Feed API Tests
 * Tests for /api/news/rss endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/db", () => ({
    prisma: {
        newspaperEdition: {
            findMany: vi.fn(),
        },
    },
}));

// Mock site config
vi.mock("@/config/site", () => ({
    PERSONAL: {
        name: "Test User",
        tagline: "Test Developer",
    },
    SITE_URL: "https://example.com",
}));

import { prisma } from "@/lib/db";

const mockPrisma = prisma as unknown as {
    newspaperEdition: {
        findMany: ReturnType<typeof vi.fn>;
    };
};

describe("RSS Feed API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("RSS Structure", () => {
        it("should return valid RSS 2.0 XML with content namespace", async () => {
            mockPrisma.newspaperEdition.findMany.mockResolvedValue([]);

            // Import after mocks are set up
            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();

            expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");

            const xml = await response.text();
            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<rss version="2.0"');
            expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
            expect(xml).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
        });

        it("should include correct channel metadata", async () => {
            mockPrisma.newspaperEdition.findMany.mockResolvedValue([]);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();
            const xml = await response.text();

            expect(xml).toContain("<title>The Tremors Chronicle</title>");
            expect(xml).toContain("<link>https://example.com/news</link>");
            expect(xml).toContain("<language>en-us</language>");
            expect(xml).toContain('href="https://example.com/api/news/rss"');
        });

        it("should include Cache-Control header", async () => {
            mockPrisma.newspaperEdition.findMany.mockResolvedValue([]);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();

            expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600, s-maxage=3600");
        });
    });

    describe("RSS Items", () => {
        it("should include all required item fields", async () => {
            const mockEdition = {
                id: "test-123",
                date: new Date("2025-12-24T12:00:00Z"),
                headline: "Test Headline",
                subheadline: "Test Subheadline",
                bodyContent: JSON.stringify(["First paragraph", "Second paragraph"]),
                createdAt: new Date(),
            };

            mockPrisma.newspaperEdition.findMany.mockResolvedValue([mockEdition]);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();
            const xml = await response.text();

            // Check item structure
            expect(xml).toContain("<item>");
            expect(xml).toContain("<title>Test Headline</title>");
            expect(xml).toContain("<link>https://example.com/news?edition=test-123</link>");
            expect(xml).toContain("<description>");
            expect(xml).toContain("<pubDate>");
            expect(xml).toContain('<guid isPermaLink="false">test-123</guid>');
        });

        it("should include full content in content:encoded", async () => {
            const mockEdition = {
                id: "test-456",
                date: new Date("2025-12-24T12:00:00Z"),
                headline: "Content Test",
                subheadline: "Testing full content",
                bodyContent: JSON.stringify(["First paragraph here", "Second paragraph here"]),
                createdAt: new Date(),
            };

            mockPrisma.newspaperEdition.findMany.mockResolvedValue([mockEdition]);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();
            const xml = await response.text();

            // Check content:encoded contains full body
            expect(xml).toContain("<content:encoded>");
            expect(xml).toContain("<![CDATA[");
            expect(xml).toContain("<h2>Testing full content</h2>");
            expect(xml).toContain("<p>First paragraph here</p>");
            expect(xml).toContain("<p>Second paragraph here</p>");
        });

        it("should handle multiple editions", async () => {
            const editions = [
                {
                    id: "edition-1",
                    date: new Date("2025-12-24"),
                    headline: "Headline One",
                    subheadline: "Sub One",
                    bodyContent: JSON.stringify(["Body one"]),
                    createdAt: new Date(),
                },
                {
                    id: "edition-2",
                    date: new Date("2025-12-23"),
                    headline: "Headline Two",
                    subheadline: "Sub Two",
                    bodyContent: JSON.stringify(["Body two"]),
                    createdAt: new Date(),
                },
            ];

            mockPrisma.newspaperEdition.findMany.mockResolvedValue(editions);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();
            const xml = await response.text();

            expect(xml).toContain("Headline One");
            expect(xml).toContain("Headline Two");
            expect(xml).toContain("edition-1");
            expect(xml).toContain("edition-2");
        });
    });

    describe("RSS Edge Cases", () => {
        it("should handle empty editions list", async () => {
            mockPrisma.newspaperEdition.findMany.mockResolvedValue([]);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();
            const xml = await response.text();

            expect(response.status).toBe(200);
            expect(xml).toContain("<channel>");
            expect(xml).not.toContain("<item>");
        });

        it("should escape XML special characters in content", async () => {
            const mockEdition = {
                id: "escape-test",
                date: new Date(),
                headline: "Test <script> & \"quotes\"",
                subheadline: "Sub with 'apostrophe'",
                bodyContent: JSON.stringify(["Para with <html> & special chars"]),
                createdAt: new Date(),
            };

            mockPrisma.newspaperEdition.findMany.mockResolvedValue([mockEdition]);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();
            const xml = await response.text();

            // Check XML escaping in title
            expect(xml).toContain("&lt;script&gt;");
            expect(xml).toContain("&amp;");
            expect(xml).toContain("&quot;");
        });

        it("should handle invalid JSON in bodyContent gracefully", async () => {
            const mockEdition = {
                id: "invalid-json",
                date: new Date(),
                headline: "Invalid Body Test",
                subheadline: "Fallback to subheadline",
                bodyContent: "not valid json",
                createdAt: new Date(),
            };

            mockPrisma.newspaperEdition.findMany.mockResolvedValue([mockEdition]);

            const { GET } = await import("@/app/api/news/rss/route");
            const response = await GET();
            const xml = await response.text();

            // Should still return valid RSS, using subheadline as description
            expect(response.status).toBe(200);
            expect(xml).toContain("Invalid Body Test");
            expect(xml).toContain("Fallback to subheadline");
        });
    });
});
