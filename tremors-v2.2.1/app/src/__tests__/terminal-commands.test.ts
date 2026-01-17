/**
 * Terminal Command Execution Tests
 * T-002: Test terminal command handlers
 */

import { describe, it, expect } from "vitest";
import { commands, type CommandContext } from "@/app/terminal/lib/commands";
import type { GitHubUser, GitHubRepo } from "@/types";

// Mock data for testing
const mockUser: GitHubUser = {
    login: "testuser",
    name: "Test User",
    bio: "A test bio",
    avatar_url: "https://example.com/avatar.jpg",
    html_url: "https://github.com/testuser",
    public_repos: 10,
    followers: 100,
    following: 50,
};

const mockRepo: GitHubRepo = {
    id: 1,
    name: "test-repo",
    full_name: "testuser/test-repo",
    description: "A test repository",
    html_url: "https://github.com/testuser/test-repo",
    homepage: "https://test-repo.com",
    stargazers_count: 50,
    forks_count: 10,
    language: "TypeScript",
    topics: ["typescript", "react"],
    pushed_at: "2024-01-01T00:00:00Z",
    created_at: "2023-01-01T00:00:00Z",
    fork: false,
};

const createContext = (overrides: Partial<CommandContext> = {}): CommandContext => ({
    repos: [mockRepo],
    user: mockUser,
    hiddenRepos: new Set(),
    isAdmin: false,
    termTheme: "rosepine",
    termFont: "mono",
    commandHistory: [],
    commandBlocks: [],
    ...overrides,
});

describe("Terminal Commands", () => {
    describe("Basic Commands", () => {
        it("help command should list available commands", () => {
            const ctx = createContext();
            const result = commands.help([], ctx);

            expect(result.lines.length).toBeGreaterThan(0);
            expect(result.lines.some(l => l.content.includes("whoami"))).toBe(true);
        });

        it("whoami should show user info", () => {
            const ctx = createContext();
            const result = commands.whoami([], ctx);

            expect(result.lines.length).toBeGreaterThan(0);
        });

        it("clear should return clear action", () => {
            const ctx = createContext();
            const result = commands.clear([], ctx);

            expect(result.action).toBe("clear");
        });

        it("exit should return exit action", () => {
            const ctx = createContext();
            const result = commands.exit([], ctx);

            expect(result.action).toBe("exit");
        });
    });

    describe("Project Commands", () => {
        it("projects should list repos", () => {
            const ctx = createContext();
            const result = commands.projects([], ctx);

            expect(result.lines.length).toBeGreaterThan(0);
            expect(result.lines.some(l => l.content.includes("test-repo"))).toBe(true);
        });

        it("ls alias should work", () => {
            const ctx = createContext();
            const result = commands.ls([], ctx);

            expect(result.lines.length).toBeGreaterThan(0);
        });

        it("repo command should require argument", () => {
            const ctx = createContext();
            const result = commands.repo([], ctx);

            expect(result.lines.some(l => l.type === "error" || l.content.includes("Usage"))).toBe(true);
        });

        it("repo with valid name should show details", () => {
            const ctx = createContext();
            const result = commands.repo(["test-repo"], ctx);

            expect(result.lines.length).toBeGreaterThan(0);
        });
    });

    describe("Theme Commands", () => {
        it("theme without args should open selector", () => {
            const ctx = createContext();
            const result = commands.theme([], ctx);

            expect(result.action).toBe("openThemeSelector");
        });
    });

    describe("Admin Commands", () => {
        it("hide should require admin", () => {
            const ctx = createContext({ isAdmin: false });
            const result = commands.hide(["test-repo"], ctx);

            expect(result.lines.some(l => l.type === "error")).toBe(true);
        });

        it("show should require admin", () => {
            const ctx = createContext({ isAdmin: false });
            const result = commands.show(["test-repo"], ctx);

            expect(result.lines.some(l => l.type === "error")).toBe(true);
        });

        it("logout should work for admin", () => {
            const ctx = createContext({ isAdmin: true });
            const result = commands.logout([], ctx);

            expect(result.action).toBe("logout");
        });

        it("logout should require admin", () => {
            const ctx = createContext({ isAdmin: false });
            const result = commands.logout([], ctx);

            expect(result.lines.some(l => l.type === "error")).toBe(true);
        });
    });

    describe("History", () => {
        it("history with no commands should show message", () => {
            const ctx = createContext({ commandHistory: [] });
            const result = commands.history([], ctx);

            expect(result.lines.some(l => l.content.includes("No command history") || l.content.includes("empty"))).toBe(true);
        });

        it("history with commands should list them", () => {
            const ctx = createContext({ commandHistory: ["whoami", "projects"] });
            const result = commands.history([], ctx);

            expect(result.lines.some(l => l.content.includes("whoami"))).toBe(true);
        });
    });
});
