/**
 * Shared Types
 * Central type definitions for the portfolio
 */

// ============================================
// GITHUB TYPES
// ============================================

export interface GitHubUser {
    login: string;
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    html_url: string;
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics: string[];
    pushed_at: string;
    created_at: string;
    fork: boolean;
    // Admin properties (from database)
    featured?: boolean;
    order?: number;
    hidden?: boolean;
    // Image settings
    imageSource?: "github" | "custom" | "none" | null;
    customImageUrl?: string | null;
}

export interface GitHubEvent {
    id: string;
    type: string;
    repo: {
        name: string;
        url: string;
    };
    created_at: string;
    payload: {
        commits?: Array<{
            message: string;
            sha: string;
        }>;
        action?: string;
        ref?: string;
        ref_type?: string;
    };
}

// Commit type for displaying recent commits
export interface GitHubCommit {
    sha: string;
    message: string;
    date: string;
    repoName: string;
    repoUrl: string;
    author: string;
}

// Unified activity item for displaying recent activity
export interface ActivityItem {
    id: string;
    type: 'commit' | 'create' | 'release' | 'pr' | 'star' | 'fork';
    title: string;
    repoName: string;
    repoUrl: string;
    date: string;
    description?: string;
}

// ============================================
// PORTFOLIO TYPES
// ============================================

export interface PortfolioData {
    user: GitHubUser | null;
    repos: GitHubRepo[];
    featuredRepos: GitHubRepo[];
    activity: GitHubEvent[];
    recentCommits: GitHubCommit[];
    recentActivity: ActivityItem[];
    totalStars: number;
    totalCommits: number;
    error: string | null;
}

export interface ModeProps {
    data: PortfolioData;
}

// ============================================
// TERMINAL TYPES
// ============================================

export interface TerminalLine {
    type: "input" | "output" | "error" | "success" | "system" | "heading";
    content: string;
}

export interface CommandBlock {
    command: string;
    lines: TerminalLine[];
}

export interface TuiSelector {
    type: "theme" | "font";
    options: string[];
    selectedIndex: number;
}

export type ThemeId = "dracula" | "tokyonight" | "rosepine";
export type FontId = "mono" | "firacode" | "jetbrains";

export interface ThemeColors {
    name: string;
    bg: string;
    text: string;
    primary: string;
    secondary: string;
    muted: string;
    error: string;
    success: string;
    system: string;
    panel: string;
    border: string;
}

// ============================================
// CONFIG TYPES
// ============================================

export interface SectionConfig {
    id: string;
    title: string;
    enabled: boolean;
    order: number;
}

export interface ContactLink {
    id: string;
    label: string;
    url: string;
    icon: string;
}

export interface SkillCategory {
    id: string;
    label: string;
    skills: string[];
}
