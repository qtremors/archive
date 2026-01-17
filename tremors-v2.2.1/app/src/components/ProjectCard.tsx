/**
 * Project Grid Sub-components
 * Reusable card components extracted from ProjectsGrid
 */

"use client";

import { Star, EyeOff, Eye, StarOff, GripVertical, ExternalLink, Pencil } from "lucide-react";
import { LANGUAGE_COLORS } from "@/lib/github";
import { formatProjectTitle } from "@/lib/utils";
import type { GitHubRepo } from "@/types";

/**
 * Get project image URL based on imageSource setting
 */
function getProjectImageUrl(repo: GitHubRepo): string | null {
    const source = repo.imageSource ?? "github";
    switch (source) {
        case "github": {
            // OpenGraph format: https://opengraph.githubassets.com/1/<owner>/<repo>
            const owner = repo.full_name.split("/")[0];
            const repoName = repo.full_name.split("/")[1];
            return `https://opengraph.githubassets.com/1/${owner}/${repoName}`;
        }
        case "custom":
            return repo.customImageUrl || null;
        case "none":
        default:
            return null;
    }
}

export interface RepoWithStatus extends GitHubRepo {
    hidden?: boolean;
    featured?: boolean;
    order?: number;
}

interface AdminControlsProps {
    repo: RepoWithStatus;
    onToggleFeatured: (e: React.MouseEvent, id: number, featured: boolean) => void;
    onToggleVisibility: (e: React.MouseEvent, id: number, hidden: boolean) => void;
    onEdit?: (e: React.MouseEvent, repo: RepoWithStatus) => void;
}

export function AdminControls({ repo, onToggleFeatured, onToggleVisibility, onEdit }: AdminControlsProps) {
    return (
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
            <div className="p-1.5 rounded-lg bg-[var(--bg)]/80 text-[var(--text-muted)]">
                <GripVertical className="w-4 h-4" />
            </div>
            {onEdit && (
                <button
                    onClick={(e) => onEdit(e, repo)}
                    className="p-1.5 rounded-lg bg-[var(--bg)]/80 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
                    title="Edit name & description"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            )}
            <button
                onClick={(e) => onToggleFeatured(e, repo.id, repo.featured || false)}
                className={`p-1.5 rounded-lg transition-colors ${repo.featured
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-[var(--bg)]/80 text-[var(--text-muted)] hover:text-amber-400"
                    }`}
                title={repo.featured ? "Unfeature" : "Feature"}
            >
                {repo.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button
                onClick={(e) => onToggleVisibility(e, repo.id, repo.hidden || false)}
                className={`p-1.5 rounded-lg transition-colors ${repo.hidden ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                    }`}
                title={repo.hidden ? "Show" : "Hide"}
            >
                {repo.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}

interface ProjectCardProps {
    repo: RepoWithStatus;
    size: "large" | "medium" | "small" | "list";
    editMode: boolean;
    isAdmin: boolean;
    isDragged: boolean;
    isDragOver: boolean;
    onDragStart?: (e: React.DragEvent, id: number) => void;
    onDragOver?: (e: React.DragEvent, id: number) => void;
    onDragLeave?: () => void;
    onDrop?: (e: React.DragEvent, id: number) => void;
    onDragEnd?: () => void;
    onToggleFeatured: (e: React.MouseEvent, id: number, featured: boolean) => void;
    onToggleVisibility: (e: React.MouseEvent, id: number, hidden: boolean) => void;
    onEdit?: (e: React.MouseEvent, repo: RepoWithStatus) => void;
    showImages?: boolean;  // Global toggle for images
}

export function ProjectCard({
    repo,
    size,
    editMode,
    isAdmin,
    isDragged,
    isDragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onToggleFeatured,
    onToggleVisibility,
    onEdit,
    showImages = true,
}: ProjectCardProps) {
    const padding = size === "large" ? "p-6" : size === "medium" ? "p-5" : size === "list" ? "p-4" : "p-5";
    const titleSize = size === "large" ? "text-xl" : size === "medium" ? "text-lg" : size === "list" ? "text-base" : "text-lg";
    const languageSize = size === "large" ? "text-sm" : "text-xs";

    // U-004: Enhanced drag-drop visual feedback
    const cardClasses = `group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 bg-[var(--card-bg)] backdrop-blur-sm h-full ${isDragged
        ? "opacity-50 border-[var(--accent-cyan)] scale-[0.97] rotate-1 shadow-lg"
        : isDragOver
            ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 scale-[1.02] shadow-xl shadow-cyan-500/20 ring-2 ring-[var(--accent-cyan)]/30"
            : repo.hidden
                ? "border-red-500/30 opacity-40 grayscale"
                : "border-[var(--card-border)] hover:border-[var(--accent-cyan)]/50"
        } ${editMode ? "cursor-grab active:cursor-grabbing" : ""}`;

    // List view: Horizontal layout
    if (size === "list") {
        const imageUrl = showImages ? getProjectImageUrl(repo) : null;
        return (
            <div
                draggable={isAdmin && editMode}
                onDragStart={editMode ? (e) => onDragStart?.(e, repo.id) : undefined}
                onDragOver={editMode ? (e) => onDragOver?.(e, repo.id) : undefined}
                onDragLeave={editMode ? onDragLeave : undefined}
                onDrop={editMode ? (e) => onDrop?.(e, repo.id) : undefined}
                onDragEnd={editMode ? onDragEnd : undefined}
                className={`${cardClasses} flex`}
            >
                {/* Thumbnail on left */}
                {imageUrl && (
                    <div className="relative w-32 sm:w-48 flex-shrink-0 bg-[var(--bg-secondary)]">
                        <img
                            src={imageUrl}
                            alt={`${repo.name} preview`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                )}
                {/* Content on right */}
                <div className={`flex-1 ${padding} flex flex-col justify-center min-w-0`}>
                    {/* Admin Controls */}
                    {editMode && (
                        <AdminControls
                            repo={repo}
                            onToggleFeatured={onToggleFeatured}
                            onToggleVisibility={onToggleVisibility}
                            onEdit={onEdit}
                        />
                    )}
                    {/* Title + Language */}
                    <div className="flex items-center gap-3 mb-1">
                        <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${titleSize} font-bold group-hover:!text-cyan-400 transition-colors truncate`}
                        >
                            {formatProjectTitle(repo.name)}
                        </a>
                        {repo.language && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#888" }}
                                />
                                <span className="text-xs text-[var(--text-muted)]">{repo.language}</span>
                            </div>
                        )}
                        {!editMode && repo.homepage && (
                            <a
                                href={repo.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors flex-shrink-0"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Live
                            </a>
                        )}
                    </div>
                    {/* Description */}
                    <p className="text-sm text-[var(--text-muted)] line-clamp-1 mb-2">
                        {repo.description || "No description"}
                    </p>
                    {/* Topics */}
                    {repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {repo.topics.slice(0, 4).map((topic: string) => (
                                <span
                                    key={topic}
                                    className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Grid view: Vertical layout (existing)
    return (
        <div
            draggable={isAdmin && editMode}
            onDragStart={editMode ? (e) => onDragStart?.(e, repo.id) : undefined}
            onDragOver={editMode ? (e) => onDragOver?.(e, repo.id) : undefined}
            onDragLeave={editMode ? onDragLeave : undefined}
            onDrop={editMode ? (e) => onDrop?.(e, repo.id) : undefined}
            onDragEnd={editMode ? onDragEnd : undefined}
            className={cardClasses}
        >
            {/* Project Image */}
            {(() => {
                const imageUrl = showImages ? getProjectImageUrl(repo) : null;
                return imageUrl && (
                    <div className="relative w-full aspect-[2/1] bg-[var(--bg-secondary)]">
                        <img
                            src={imageUrl}
                            alt={`${repo.name} preview`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                        />
                    </div>
                );
            })()}
            <div className={`relative ${padding}`}>
                {/* Admin Controls - positioned relative to content area */}
                {editMode && (
                    <AdminControls
                        repo={repo}
                        onToggleFeatured={onToggleFeatured}
                        onToggleVisibility={onToggleVisibility}
                        onEdit={onEdit}
                    />
                )}
                {/* Top row: Language + Live link */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {repo.language && (
                            <>
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#888" }}
                                />
                                <span className={`${languageSize} text-[var(--text-muted)]`}>{repo.language}</span>
                            </>
                        )}
                    </div>
                    {!editMode && repo.homepage && (
                        <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 ${languageSize} text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors`}
                        >
                            <ExternalLink className={size === "large" ? "w-4 h-4" : "w-3 h-3"} />
                            Website
                        </a>
                    )}
                </div>

                {/* Title links to GitHub */}
                <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${titleSize} font-bold mb-2 block group-hover:!text-cyan-400 transition-colors ${size === "small" ? "truncate" : ""}`}
                >
                    {formatProjectTitle(repo.name)}
                </a>

                <p className={`text-[var(--text-muted)] line-clamp-2 mb-3 ${size === "small" ? "text-sm" : ""}`}>
                    {repo.description || "No description"}
                </p>

                {/* Topics */}
                {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 overflow-hidden">
                        {repo.topics.slice(0, 3).map((topic: string) => (
                            <span
                                key={topic}
                                className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] max-w-[120px] truncate"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
