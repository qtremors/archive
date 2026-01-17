import { describe, it, expect } from "vitest";
import {
    getISTDateString,
    getISTParts,
    getStartOfDayIST,
    getEndOfDayIST,
    IST_TIMEZONE
} from "./date";

describe("date utility (IST)", () => {
    it("should return correct IST date string (YYYY-MM-DD)", () => {
        // 2024-01-01 01:00 UTC is 2024-01-01 06:30 IST
        const date = new Date("2024-01-01T01:00:00Z");
        expect(getISTDateString(date)).toBe("2024-01-01");

        // 2024-01-01 22:00 UTC is 2024-01-02 03:30 IST
        const date2 = new Date("2024-01-01T22:00:00Z");
        expect(getISTDateString(date2)).toBe("2024-01-02");
    });

    it("should extract correct IST parts", () => {
        const date = new Date("2024-01-01T22:00:00Z"); // 2024-01-02 03:30 IST
        const parts = getISTParts(date);
        expect(parts.year).toBe(2024);
        expect(parts.month).toBe(1);
        expect(parts.day).toBe(2);
        expect(parts.hour).toBe(3);
        expect(parts.minute).toBe(30);
    });

    it("should return correct start of day in IST", () => {
        const date = new Date("2024-01-01T22:00:00Z"); // 2024-01-02 03:30 IST
        const start = getStartOfDayIST(date);

        // Start of 2024-01-02 in IST is 2024-01-01 18:30 UTC
        expect(start.toISOString()).toBe("2024-01-01T18:30:00.000Z");
    });

    it("should return correct end of day in IST", () => {
        const date = new Date("2024-01-01T22:00:00Z"); // 2024-01-02 03:30 IST
        const end = getEndOfDayIST(date);

        // End of 2024-01-02 in IST is 2024-01-02 18:29:59.999 UTC
        expect(end.toISOString()).toBe("2024-01-02T18:29:59.999Z");
    });
});
