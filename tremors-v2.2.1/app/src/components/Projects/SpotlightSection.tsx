/**
 * SpotlightSection - Featured projects grid layout
 */

"use client";

import { ProjectCard, RepoWithStatus } from "@/components/ProjectCard";
import type { GitHubRepo } from "@/types";

interface SpotlightSectionProps {
    spotlightRepos: RepoWithStatus[];
    initialRepos: GitHubRepo[];  // For push date data
    viewMode: "grid" | "list";
    editMode: boolean;
    isAdmin: boolean;
    draggedId: number | null;
    dragOverId: number | null;
    showImages: boolean;
    handlers: {
        handleDragStart: (e: React.DragEvent, id: number) => void;
        handleDragOver: (e: React.DragEvent, id: number) => void;
        handleDragLeave: () => void;
        handleDrop: (e: React.DragEvent, targetId: number) => void;
        handleDragEnd: () => void;
        toggleFeatured: (e: React.MouseEvent, id: number, featured: boolean) => void;
        toggleVisibility: (e: React.MouseEvent, id: number, hidden: boolean) => void;
        handleEdit: (e: React.MouseEvent, repo: RepoWithStatus) => void;
    };
}

export function SpotlightSection({
    spotlightRepos,
    initialRepos,
    viewMode,
    editMode,
    isAdmin,
    draggedId,
    dragOverId,
    showImages,
    handlers,
}: SpotlightSectionProps) {
    if (spotlightRepos.length === 0) return null;

    if (viewMode === "list") {
        return (
            <div className="space-y-4">
                {spotlightRepos.map((repo) => (
                    <ProjectCard
                        key={repo.id}
                        repo={repo}
                        size="list"
                        editMode={editMode}
                        isAdmin={isAdmin}
                        isDragged={draggedId === repo.id}
                        isDragOver={dragOverId === repo.id}
                        onDragStart={handlers.handleDragStart}
                        onDragOver={handlers.handleDragOver}
                        onDragLeave={handlers.handleDragLeave}
                        onDrop={handlers.handleDrop}
                        onDragEnd={handlers.handleDragEnd}
                        onToggleFeatured={handlers.toggleFeatured}
                        onToggleVisibility={handlers.toggleVisibility}
                        onEdit={handlers.handleEdit}
                        showImages={showImages}
                    />
                ))}
            </div>
        );
    }

    // Find the most recently pushed repo for last active display
    const lastUpdated = [...initialRepos]
        .filter(r => r.pushed_at)
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())[0];

    const timeAgo = lastUpdated?.pushed_at ? (() => {
        const diff = Date.now() - new Date(lastUpdated.pushed_at).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "just now";
    })() : null;

    // Grid: 2+3 Bento Layout
    return (
        <div className="space-y-4">
            {/* Top row: 2 featured cards with center logo placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* First featured card - spans 2 columns */}
                {spotlightRepos[0] && (
                    <div className="md:col-span-2 aspect-[2/1]">
                        <ProjectCard
                            repo={spotlightRepos[0]}
                            size="large"
                            editMode={editMode}
                            isAdmin={isAdmin}
                            isDragged={draggedId === spotlightRepos[0].id}
                            isDragOver={dragOverId === spotlightRepos[0].id}
                            onDragStart={handlers.handleDragStart}
                            onDragOver={handlers.handleDragOver}
                            onDragLeave={handlers.handleDragLeave}
                            onDrop={handlers.handleDrop}
                            onDragEnd={handlers.handleDragEnd}
                            onToggleFeatured={handlers.toggleFeatured}
                            onToggleVisibility={handlers.toggleVisibility}
                            onEdit={handlers.handleEdit}
                            showImages={showImages}
                        />
                    </div>
                )}

                {/* Center placeholder - Logo + Last Updated Repo */}
                {spotlightRepos.length >= 2 && (
                    <div className="hidden md:flex md:col-span-1 aspect-[1/1] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]/50">
                        <div className="text-center group p-4">
                            <a
                                href="https://github.com/qtremors"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mb-4"
                            >
                                <span className="inline-block logo-glow-hover">
                                    <img
                                        src="/alien.svg"
                                        alt="Logo"
                                        className="w-16 h-16 opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                                    />
                                </span>
                            </a>
                            {lastUpdated && (
                                <a
                                    href={lastUpdated.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block hover:text-[var(--accent-cyan)] transition-colors"
                                >
                                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">Last Active</p>
                                    <p className="text-sm font-semibold truncate max-w-[140px] mx-auto mb-1">{lastUpdated.name}</p>
                                    <p className="text-xs text-[var(--accent-cyan)] font-medium">{timeAgo}</p>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Second featured card - spans 2 columns */}
                {spotlightRepos[1] && (
                    <div className="md:col-span-2 aspect-[2/1]">
                        <ProjectCard
                            repo={spotlightRepos[1]}
                            size="large"
                            editMode={editMode}
                            isAdmin={isAdmin}
                            isDragged={draggedId === spotlightRepos[1].id}
                            isDragOver={dragOverId === spotlightRepos[1].id}
                            onDragStart={handlers.handleDragStart}
                            onDragOver={handlers.handleDragOver}
                            onDragLeave={handlers.handleDragLeave}
                            onDrop={handlers.handleDrop}
                            onDragEnd={handlers.handleDragEnd}
                            onToggleFeatured={handlers.toggleFeatured}
                            onToggleVisibility={handlers.toggleVisibility}
                            onEdit={handlers.handleEdit}
                            showImages={showImages}
                        />
                    </div>
                )}
            </div>

            {/* Bottom row: 3 smaller featured cards */}
            {spotlightRepos.length > 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {spotlightRepos.slice(2, 5).map((repo) => (
                        <div key={repo.id} className="aspect-[2/1]">
                            <ProjectCard
                                repo={repo}
                                size="medium"
                                editMode={editMode}
                                isAdmin={isAdmin}
                                isDragged={draggedId === repo.id}
                                isDragOver={dragOverId === repo.id}
                                onDragStart={handlers.handleDragStart}
                                onDragOver={handlers.handleDragOver}
                                onDragLeave={handlers.handleDragLeave}
                                onDrop={handlers.handleDrop}
                                onDragEnd={handlers.handleDragEnd}
                                onToggleFeatured={handlers.toggleFeatured}
                                onToggleVisibility={handlers.toggleVisibility}
                                onEdit={handlers.handleEdit}
                                showImages={showImages}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

