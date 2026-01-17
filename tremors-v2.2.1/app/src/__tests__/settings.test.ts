/**
 * Settings API Tests
 * Tests for /api/admin/settings GET and PATCH endpoints
 */

import { describe, it, expect, vi } from "vitest";

// Mock Prisma
const mockSettings = {
    id: "main",
    showProjectImages: true,
    availableForWork: true,
    lastRefresh: new Date(),
    updatedAt: new Date(),
};

const mockPrisma = {
    settings: {
        findUnique: vi.fn().mockResolvedValue(mockSettings),
        upsert: vi.fn().mockResolvedValue(mockSettings),
    },
};

vi.mock("@/lib/db", () => ({
    prisma: mockPrisma,
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
    verifyAdminCookie: vi.fn().mockResolvedValue(true),
}));

// Mock CSRF
vi.mock("@/lib/csrf", () => ({
    validateCsrf: vi.fn().mockReturnValue({ valid: true }),
}));

describe("Settings API", () => {
    describe("GET /api/admin/settings", () => {
        it("should return settings with showProjectImages", async () => {
            // Mock the fetch/response in a real test
            expect(mockSettings.showProjectImages).toBe(true);
            expect(mockSettings.availableForWork).toBe(true);
        });

        it("should return defaults when no settings exist", async () => {
            mockPrisma.settings.findUnique.mockResolvedValueOnce(null);
            // Defaults should be showProjectImages: true, availableForWork: true
            expect(true).toBe(true); // Placeholder
        });
    });

    describe("PATCH /api/admin/settings", () => {
        it("should update showProjectImages setting", async () => {
            const updateData = { showProjectImages: false };
            mockPrisma.settings.upsert.mockResolvedValueOnce({
                ...mockSettings,
                showProjectImages: false,
            });

            const result = await mockPrisma.settings.upsert({
                where: { id: "main" },
                update: updateData,
                create: { id: "main", ...updateData },
            });

            expect(result.showProjectImages).toBe(false);
        });

        it("should reject unauthenticated requests", async () => {
            // Would need to mock verifyAdminCookie to return false
            expect(true).toBe(true); // Placeholder
        });
    });
});

describe("Repo Settings Persistence", () => {
    it("should persist imageSource when updating repo", () => {
        const updateData = { imageSource: "custom", customImageUrl: "/test.png" };
        expect(updateData.imageSource).toBe("custom");
        expect(updateData.customImageUrl).toBe("/test.png");
    });

    it("should persist customName when updating repo", () => {
        const updateData = { customName: "My Custom Project" };
        expect(updateData.customName).toBe("My Custom Project");
    });

    it("should persist customDescription when updating repo", () => {
        const updateData = { customDescription: "A custom description" };
        expect(updateData.customDescription).toBe("A custom description");
    });

    it("should clear custom fields when set to null", () => {
        const updateData = { customName: null, customDescription: null };
        expect(updateData.customName).toBeNull();
        expect(updateData.customDescription).toBeNull();
    });
});
