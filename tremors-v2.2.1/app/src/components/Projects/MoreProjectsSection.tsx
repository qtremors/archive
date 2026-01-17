/**
 * MoreProjectsSection - Secondary projects list/grid
 */

"use client";

import { ChevronDown } from "lucide-react";
import { ProjectCard, RepoWithStatus } from "@/components/ProjectCard";

interface MoreProjectsSectionProps {
    otherRepos: RepoWithStatus[];
    visibleOtherCount: number;
    viewMode: "grid" | "list";
    editMode: boolean;
    isAdmin: boolean;
    draggedId: number | null;
    dragOverId: number | null;
    showImages: boolean;
    onShowMore: () => void;
    onShowLess: () => void;
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

export function MoreProjectsSection({
    otherRepos,
    visibleOtherCount,
    viewMode,
    editMode,
    isAdmin,
    draggedId,
    dragOverId,
    showImages,
    onShowMore,
    onShowLess,
    handlers,
}: MoreProjectsSectionProps) {
    if (otherRepos.length === 0) return null;

    const displayedRepos = editMode ? otherRepos : otherRepos.slice(0, visibleOtherCount);

    return (
        <div className="space-y-6">
            {/* Header with counter */}
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold text-[var(--text-muted)]">More Projects</h3>
                <span className="flex-1 h-px bg-[var(--border)]" />
                {!editMode && otherRepos.length > 6 && (
                    <span className="text-sm text-[var(--text-muted)]">
                        {Math.min(visibleOtherCount, otherRepos.length)} of {otherRepos.length}
                    </span>
                )}
            </div>

            {/* Projects grid/list */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                {displayedRepos.map((repo) => (
                    <div key={repo.id} className={viewMode === "grid" ? "aspect-[2/1]" : ""}>
                        <ProjectCard
                            repo={repo}
                            size={viewMode === "grid" ? "small" : "list"}
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

            {/* Show More/Less Buttons */}
            {!editMode && otherRepos.length > 6 && (
                <div className="mt-6 flex justify-center gap-3">
                    {visibleOtherCount > 6 && (
                        <button
                            onClick={onShowLess}
                            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/5 transition-all"
                        >
                            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] rotate-180" />
                            <span className="text-[var(--text-muted)] group-hover:text-[var(--text)]">Show Less</span>
                        </button>
                    )}
                    {visibleOtherCount < otherRepos.length && (
                        <button
                            onClick={onShowMore}
                            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/5 transition-all"
                        >
                            <span className="text-[var(--text-muted)] group-hover:text-[var(--text)]">Show More</span>
                            <span className="text-xs text-[var(--accent-cyan)]">+{Math.min(6, otherRepos.length - visibleOtherCount)}</span>
                            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)]" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
