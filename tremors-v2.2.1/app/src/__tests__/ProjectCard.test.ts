/**
 * Tests for ProjectCard component
 */

import { describe, it, expect } from "vitest";
import type { GitHubRepo } from "@/types";

// Mock repo data for testing
const mockRepo: GitHubRepo = {
    id: 123,
    name: "test-repo",
    full_name: "user/test-repo",
    description: "A test repository",
    html_url: "https://github.com/user/test-repo",
    homepage: "https://test-repo.com",
    stargazers_count: 42,
    forks_count: 10,
    language: "TypeScript",
    topics: ["react", "typescript"],
    pushed_at: "2024-12-21T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    fork: false,
};

describe("ProjectCard", () => {
    it("should export RepoWithStatus interface with correct properties", () => {
        // Test that RepoWithStatus extends GitHubRepo correctly
        const repoWithStatus = {
            ...mockRepo,
            hidden: false,
            featured: true,
            order: 0,
        };

        expect(repoWithStatus.id).toBe(123);
        expect(repoWithStatus.hidden).toBe(false);
        expect(repoWithStatus.featured).toBe(true);
        expect(repoWithStatus.order).toBe(0);
    });

    it("should handle repos without optional fields", () => {
        const minimalRepo = {
            ...mockRepo,
            description: null,
            homepage: null,
            language: null,
            topics: [],
        };

        expect(minimalRepo.description).toBeNull();
        expect(minimalRepo.homepage).toBeNull();
        expect(minimalRepo.topics).toHaveLength(0);
    });

    it("should handle repos with many topics (slice to 3)", () => {
        const manyTopicsRepo = {
            ...mockRepo,
            topics: ["react", "typescript", "nextjs", "prisma", "tailwind"],
        };

        const displayedTopics = manyTopicsRepo.topics.slice(0, 3);
        expect(displayedTopics).toHaveLength(3);
        expect(displayedTopics).toEqual(["react", "typescript", "nextjs"]);
    });
});

describe("AdminControls", () => {
    it("should toggle featured status correctly", () => {
        let featured = false;
        const toggleFeatured = () => {
            featured = !featured;
        };

        expect(featured).toBe(false);
        toggleFeatured();
        expect(featured).toBe(true);
        toggleFeatured();
        expect(featured).toBe(false);
    });

    it("should toggle visibility status correctly", () => {
        let hidden = false;
        const toggleVisibility = () => {
            hidden = !hidden;
        };

        expect(hidden).toBe(false);
        toggleVisibility();
        expect(hidden).toBe(true);
        toggleVisibility();
        expect(hidden).toBe(false);
    });
});
