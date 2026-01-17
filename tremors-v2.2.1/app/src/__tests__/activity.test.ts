/**
 * Tests for activity.ts utilities
 * T-002: Expanded test coverage
 */

import { describe, it, expect } from "vitest";
import { eventToActivityItem, eventToDbActivity } from "@/lib/activity";
import type { GitHubEvent } from "@/types";

// Helper to create mock GitHub events
function createMockEvent(type: string, overrides: Partial<GitHubEvent> = {}): GitHubEvent {
    return {
        id: "123456",
        type,
        repo: {
            name: "qtremors/test-repo",
            url: "https://api.github.com/repos/qtremors/test-repo",
        },
        created_at: "2024-12-23T10:00:00Z",
        payload: {},
        ...overrides,
    };
}

describe("eventToActivityItem", () => {
    it("should convert CreateEvent to create activity", () => {
        const event = createMockEvent("CreateEvent", {
            payload: { ref_type: "branch", ref: "main" },
        });

        const result = eventToActivityItem(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe("create");
        expect(result?.title).toBe('Created branch "main"');
        expect(result?.repoName).toBe("test-repo");
        expect(result?.repoUrl).toBe("https://github.com/qtremors/test-repo");
    });

    it("should convert ReleaseEvent to release activity", () => {
        const event = createMockEvent("ReleaseEvent", {
            payload: { action: "v1.0.0" },
        });

        const result = eventToActivityItem(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe("release");
        expect(result?.title).toBe("Released v1.0.0");
    });

    it("should convert PullRequestEvent to pr activity", () => {
        const event = createMockEvent("PullRequestEvent", {
            payload: { action: "opened" },
        });

        const result = eventToActivityItem(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe("pr");
        expect(result?.title).toBe("opened pull request");
    });

    it("should convert WatchEvent to star activity", () => {
        const event = createMockEvent("WatchEvent");

        const result = eventToActivityItem(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe("star");
        expect(result?.title).toBe("Starred repository");
    });

    it("should convert ForkEvent to fork activity", () => {
        const event = createMockEvent("ForkEvent");

        const result = eventToActivityItem(event);

        expect(result).not.toBeNull();
        expect(result?.type).toBe("fork");
        expect(result?.title).toBe("Forked repository");
    });

    it("should return null for unsupported event types", () => {
        const event = createMockEvent("IssuesEvent");

        const result = eventToActivityItem(event);

        expect(result).toBeNull();
    });

    it("should extract repo name from full name correctly", () => {
        const event = createMockEvent("WatchEvent", {
            repo: {
                name: "organization/some-project",
                url: "https://api.github.com/repos/organization/some-project",
            },
        });

        const result = eventToActivityItem(event);

        expect(result?.repoName).toBe("some-project");
        expect(result?.repoUrl).toBe("https://github.com/organization/some-project");
    });
});

describe("eventToDbActivity", () => {
    it("should convert event to database-ready format with Date object", () => {
        const event = createMockEvent("WatchEvent");

        const result = eventToDbActivity(event);

        expect(result).not.toBeNull();
        expect(result?.date).toBeInstanceOf(Date);
        expect(result?.date.toISOString()).toBe("2024-12-23T10:00:00.000Z");
    });

    it("should return null for unsupported event types", () => {
        const event = createMockEvent("DeleteEvent");

        const result = eventToDbActivity(event);

        expect(result).toBeNull();
    });

    it("should preserve all required fields for database insertion", () => {
        const event = createMockEvent("CreateEvent", {
            id: "unique-id-123",
            payload: { ref_type: "repository" },
        });

        const result = eventToDbActivity(event);

        expect(result).toMatchObject({
            id: "unique-id-123",
            type: "create",
            title: "Created repository",
            repoName: "test-repo",
            repoUrl: "https://github.com/qtremors/test-repo",
        });
    });
});
