/**
 * GitHub API Utilities
 * Fetches user data, repositories, and activity from GitHub API
 */

import type { GitHubUser, GitHubRepo, GitHubEvent, GitHubCommit } from "@/types";

const GITHUB_API = 'https://api.github.com';


// Get headers with optional auth
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

// Fetch user profile
export async function getUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/users/${username}`, {
    headers: getHeaders(),
    cache: "no-store", // No ISR - data only updates when admin refreshes
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.statusText}`);
  }

  return res.json();
}

// Fetch repositories (excluding those with 'x' topic)
export async function getRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=pushed&per_page=100`,
    {
      headers: getHeaders(),
      cache: "no-store", // No ISR - data only updates when admin refreshes
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch repos: ${res.statusText}`);
  }

  const repos: GitHubRepo[] = await res.json();

  // Filter out repos with 'x' topic and forks
  return repos.filter(repo =>
    !repo.fork &&
    !repo.topics.includes('x')
  );
}


// Fetch recent activity
export async function getActivity(username: string, limit = 10): Promise<GitHubEvent[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/events/public?per_page=30`,
    {
      headers: getHeaders(),
      cache: "no-store", // No ISR - data only updates when admin refreshes
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch activity: ${res.statusText}`);
  }

  const events: GitHubEvent[] = await res.json();

  // Filter relevant events and limit
  return events
    .filter(event =>
      ['PushEvent', 'CreateEvent', 'ReleaseEvent', 'PullRequestEvent', 'WatchEvent'].includes(event.type)
    )
    .slice(0, limit);
}

// Fetch recent commits from recently updated repos
export async function getRecentCommits(repos: GitHubRepo[], limit = 10): Promise<GitHubCommit[]> {
  // Sort repos by pushed_at date (most recent first) and take top 10
  const recentRepos = [...repos]
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, 10);

  const allCommits: GitHubCommit[] = [];

  // Fetch 10 commits from each recent repo
  // Chunking to avoid rate limits (concurrent requests batch size)
  const BATCH_SIZE = 3;
  const chunks = [];
  for (let i = 0; i < recentRepos.length; i += BATCH_SIZE) {
    chunks.push(recentRepos.slice(i, i + BATCH_SIZE));
  }

  // Process batches sequentially
  for (const batch of chunks) {
    const batchPromises = batch.map(async (repo) => {
      try {
        const res = await fetch(
          `${GITHUB_API}/repos/${repo.full_name}/commits?per_page=10`,
          {
            headers: getHeaders(),
            cache: "no-store", // No ISR - data only updates when admin refreshes
          }
        );

        if (!res.ok) return [];

        const commits = await res.json();

        if (!Array.isArray(commits)) return [];

        return commits.map((c: {
          sha: string;
          commit: {
            message: string;
            author: { name: string; date: string };
          };
        }) => ({
          sha: c.sha,
          message: c.commit.message,
          date: c.commit.author.date,
          repoName: repo.name,
          repoUrl: repo.html_url,
          author: c.commit.author.name,
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(batchPromises);
    results.forEach(commits => allCommits.push(...commits));

    if (chunks.length > 1) await new Promise(r => setTimeout(r, 200));
  }

  // Sort all commits by date and return top 10
  return allCommits
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Language colors for display
export const LANGUAGE_COLORS: Record<string, string> = {
  'Python': '#3572A5',
  'TypeScript': '#3178C6',
  'JavaScript': '#F7DF1E',
  'Rust': '#DEA584',
  'HTML': '#E34C26',
  'CSS': '#563D7C',
  'Go': '#00ADD8',
  'Java': '#B07219',
  'C++': '#F34B7D',
  'C': '#555555',
  'Shell': '#89E051',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
};
