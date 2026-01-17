/**
 * ProjectsTable - Data table of featured and other projects
 */

"use client";

import { ChevronDown } from "lucide-react";

interface Repo {
    id: number;
    name: string;
    html_url: string;
    language: string | null;
    topics: string[] | null;
    homepage: string | null;
    pushed_at: string;
}

interface ProjectsTableProps {
    displayRepos: Repo[];
    otherRepos: Repo[];
    showMoreProjects: boolean;
    onToggleShowMore: () => void;
    formatProjectTitle: (name: string) => string;
}

export function ProjectsTable({
    displayRepos,
    otherRepos,
    showMoreProjects,
    onToggleShowMore,
    formatProjectTitle,
}: ProjectsTableProps) {
    return (
        <div className="space-y-6">
            <table className="w-full border-collapse my-8 text-[0.95rem] block md:table overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal">
                <caption className="font-display text-[1.25rem] font-bold text-left mb-3 uppercase tracking-[2px]">Featured Projects</caption>
                <thead>
                    <tr>
                        <th className="p-3 md:p-4 text-left border-b border-[var(--np-rule)] font-semibold uppercase text-[0.75rem] tracking-widest bg-black/5">Project</th>
                        <th className="p-3 md:p-4 text-left border-b border-[var(--np-rule)] font-semibold uppercase text-[0.75rem] tracking-widest bg-black/5">Language</th>
                        <th className="p-3 md:p-4 text-left border-b border-[var(--np-rule)] font-semibold uppercase text-[0.75rem] tracking-widest bg-black/5">Topics</th>
                        <th className="p-3 md:p-4 text-left border-b border-[var(--np-rule)] font-semibold uppercase text-[0.75rem] tracking-widest bg-black/5">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {displayRepos.map((repo) => (
                        <tr key={repo.id} className="hover:bg-black/2">
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-[var(--np-accent)] no-underline hover:underline">
                                    {formatProjectTitle(repo.name)}
                                </a>
                            </td>
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">{repo.language || "—"}</td>
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">{repo.topics?.slice(0, 3).join(", ") || "—"}</td>
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">
                                {repo.homepage ? (
                                    <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-[var(--np-accent)] no-underline hover:underline">Live</a>
                                ) : "Source"}
                            </td>
                        </tr>
                    ))}
                    {showMoreProjects && otherRepos.slice(0, 10).map((repo) => (
                        <tr key={repo.id} className="hover:bg-black/2">
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-[var(--np-accent)] no-underline hover:underline">
                                    {formatProjectTitle(repo.name)}
                                </a>
                            </td>
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">{repo.language || "—"}</td>
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">{repo.topics?.slice(0, 3).join(", ") || "—"}</td>
                            <td className="p-3 md:p-4 text-left border-b border-[var(--np-rule)]">
                                {repo.homepage ? (
                                    <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-[var(--np-accent)] no-underline hover:underline">Live</a>
                                ) : "Source"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {otherRepos.length > 0 && (
                <button
                    onClick={onToggleShowMore}
                    className="inline-flex items-center gap-2 bg-none border border-[var(--np-ink)] px-4 py-2 font-inherit text-[0.85rem] cursor-pointer text-[var(--np-ink)] no-underline transition-all duration-200 hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)] flex mx-auto my-6"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMoreProjects ? "rotate-180" : ""}`} />
                    {showMoreProjects ? "Show Less" : `Show ${Math.min(10, otherRepos.length)} More Projects`}
                </button>
            )}
        </div>
    );
}
