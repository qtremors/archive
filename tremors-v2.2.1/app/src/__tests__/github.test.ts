/**
 * Tests for github.ts utilities
 * T-002: Expanded test coverage
 */

import { describe, it, expect } from "vitest";
import { LANGUAGE_COLORS } from "@/lib/github";

describe("LANGUAGE_COLORS", () => {
    it("should have colors for common languages", () => {
        expect(LANGUAGE_COLORS["Python"]).toBe("#3572A5");
        expect(LANGUAGE_COLORS["TypeScript"]).toBe("#3178C6");
        expect(LANGUAGE_COLORS["JavaScript"]).toBe("#F7DF1E");
        expect(LANGUAGE_COLORS["Rust"]).toBe("#DEA584");
    });

    it("should have valid hex color format", () => {
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

        Object.entries(LANGUAGE_COLORS).forEach(([lang, color]) => {
            expect(color, `${lang} should have valid hex color`).toMatch(hexColorRegex);
        });
    });

    it("should include at least 10 languages", () => {
        expect(Object.keys(LANGUAGE_COLORS).length).toBeGreaterThanOrEqual(10);
    });

    it("should return undefined for unknown languages", () => {
        expect(LANGUAGE_COLORS["NonExistentLanguage"]).toBeUndefined();
    });
});
