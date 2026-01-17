/**
 * ProjectsGrid - Bento-style grid with spotlight card for first project
 * Admin can drag to reorder and toggle visibility/featured directly
 * Refactored: Uses sub-components for cleaner code
 */

"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/components/AdminContext";
import { useSettings } from "@/components/SettingsContext";
import { useToast } from "@/components/ToastProvider";
import { useFetch } from "@/hooks/useFetch";
import { RepoWithStatus } from "@/components/ProjectCard";
import { ProjectEditModal } from "@/components/ProjectEditModal";
import { GridControls } from "@/components/Projects/GridControls";
import { SpotlightSection } from "@/components/Projects/SpotlightSection";
import { MoreProjectsSection } from "@/components/Projects/MoreProjectsSection";
import type { GitHubRepo } from "@/types";

interface ProjectsGridProps {
    repos: GitHubRepo[];
}

export function ProjectsGrid({ repos: initialRepos }: ProjectsGridProps) {
    const { isAdmin, editMode } = useAdmin();
    const { settings, updateSetting } = useSettings();
    const { showProjectImages: showImages, projectViewMode: viewMode } = settings;
    const toast = useToast();

    const [repos, setRepos] = useState<RepoWithStatus[]>(initialRepos);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [dragOverId, setDragOverId] = useState<number | null>(null);
    const [visibleOtherCount, setVisibleOtherCount] = useState(6);
    const [editingRepo, setEditingRepo] = useState<RepoWithStatus | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch repos from API when admin
    const { data: adminData, loading } = useFetch<{ success: boolean; repos: any[] }>(
        isAdmin ? "/api/admin/repos" : "",
        { immediate: isAdmin }
    );

    // Update repos from admin data - only on initial load to prevent overwriting local edits
    useEffect(() => {
        if (adminData?.repos && !isInitialized) {
            const dbRepos = adminData.repos.map(
                (r: any) => ({
                    ...r,
                    full_name: r.fullName,
                    stargazers_count: r.stars,
                    forks_count: r.forks,
                    pushed_at: "",
                    created_at: "",
                    fork: false,
                })
            );
            setRepos(dbRepos);
            setIsInitialized(true);
        }
    }, [adminData, isInitialized]);

    // Toggle visibility
    const toggleVisibility = async (e: React.MouseEvent, id: number, hidden: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        const repo = repos.find((r) => r.id === id);
        try {
            await fetch("/api/admin/repos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, hidden: !hidden }),
            });
            setRepos(repos.map((r) => (r.id === id ? { ...r, hidden: !hidden } : r)));
            toast.success(`${repo?.name} ${!hidden ? "hidden" : "visible"}`);
        } catch {
            toast.error("Failed to update visibility");
        }
    };

    // Toggle featured
    const toggleFeatured = async (e: React.MouseEvent, id: number, featured: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        const repo = repos.find((r) => r.id === id);
        try {
            await fetch("/api/admin/repos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, featured: !featured }),
            });
            setRepos(repos.map((r) => (r.id === id ? { ...r, featured: !featured } : r)));
            toast.success(`${repo?.name} ${!featured ? "featured" : "unfeatured"}`);
        } catch {
            toast.error("Failed to update featured status");
        }
    };

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, id: number) => {
        e.preventDefault();
        if (draggedId !== id) setDragOverId(id);
    };

    const handleDragLeave = () => setDragOverId(null);

    const handleDrop = async (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        setDragOverId(null);
        if (draggedId === null || draggedId === targetId) return;

        const draggedIndex = repos.findIndex((r) => r.id === draggedId);
        const targetIndex = repos.findIndex((r) => r.id === targetId);

        const newRepos = [...repos];
        const [draggedItem] = newRepos.splice(draggedIndex, 1);
        newRepos.splice(targetIndex, 0, draggedItem);

        const updatedRepos = newRepos.map((r, i) => ({ ...r, order: i }));
        setRepos(updatedRepos);

        try {
            await fetch("/api/admin/repos/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orders: updatedRepos.map(r => ({ id: r.id, order: r.order }))
                }),
            });
        } catch {
            // Silently fail, state is already updated locally
        }
        setDraggedId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    // Edit handler - open modal
    const handleEdit = (e: React.MouseEvent, repo: RepoWithStatus) => {
        e.stopPropagation();
        setEditingRepo(repo);
    };

    // Update repos when modal saves/resets
    const handleEditUpdate = (updatedFields: Partial<RepoWithStatus>) => {
        if (!editingRepo) return;
        setRepos(repos.map(r =>
            r.id === editingRepo.id ? { ...r, ...updatedFields } : r
        ));
    };

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] animate-pulse h-48"
                    />
                ))}
            </div>
        );
    }

    // Filter hidden for non-admin
    const displayRepos = editMode ? repos : repos.filter((r) => !r.hidden);

    // Separate featured and regular repos
    const featuredRepos = displayRepos.filter((r) => r.featured).slice(0, 5);
    const regularRepos = displayRepos.filter((r) => !r.featured);

    const spotlightRepos = featuredRepos.length > 0
        ? featuredRepos
        : displayRepos.slice(0, Math.min(3, displayRepos.length));
    const otherRepos = featuredRepos.length > 0
        ? regularRepos
        : displayRepos.slice(Math.min(3, displayRepos.length));

    if (displayRepos.length === 0) {
        return <p className="text-[var(--text-muted)]">No projects to display</p>;
    }

    const handlers = {
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        toggleFeatured,
        toggleVisibility,
        handleEdit,
    };

    return (
        <div className="space-y-8">
            {/* Admin Controls */}
            {editMode && (
                <GridControls
                    viewMode={viewMode}
                    showImages={showImages ?? false}
                    onViewChange={(mode) => updateSetting("projectViewMode", mode)}
                    onImageToggle={() => updateSetting("showProjectImages", !showImages)}
                />
            )}

            {/* Featured Projects Section */}
            <SpotlightSection
                spotlightRepos={spotlightRepos}
                initialRepos={initialRepos}
                viewMode={viewMode}
                editMode={editMode}
                isAdmin={isAdmin}
                draggedId={draggedId}
                dragOverId={dragOverId}
                showImages={showImages ?? false}
                handlers={handlers}
            />

            {/* Other Projects Section */}
            <MoreProjectsSection
                otherRepos={otherRepos}
                visibleOtherCount={visibleOtherCount}
                viewMode={viewMode}
                editMode={editMode}
                isAdmin={isAdmin}
                draggedId={draggedId}
                dragOverId={dragOverId}
                showImages={showImages ?? false}
                onShowMore={() => setVisibleOtherCount(prev => Math.min(prev + 6, otherRepos.length))}
                onShowLess={() => setVisibleOtherCount(prev => Math.max(prev - 6, 6))}
                handlers={handlers}
            />

            {/* Edit Modal */}
            {editingRepo && (
                <ProjectEditModal
                    repo={editingRepo}
                    onClose={() => setEditingRepo(null)}
                    onUpdate={handleEditUpdate}
                />
            )}
        </div>
    );
}
