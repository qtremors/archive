/**
 * ProjectEditModal - Modal for editing project display name, description, and image settings
 * Extracted from ProjectsGrid for better code organization (Q-001)
 */

"use client";

import { useState } from "react";
import { X, Save, RotateCcw, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import type { RepoWithStatus } from "@/components/ProjectCard";

interface ProjectEditModalProps {
    repo: RepoWithStatus;
    onClose: () => void;
    onUpdate: (updatedRepo: Partial<RepoWithStatus>) => void;
}

export function ProjectEditModal({ repo, onClose, onUpdate }: ProjectEditModalProps) {
    const toast = useToast();
    const [editName, setEditName] = useState(repo.name);
    const [editDescription, setEditDescription] = useState(repo.description || "");
    const [editImageSource, setEditImageSource] = useState<string>(repo.imageSource ?? "github");
    const [editImageUrl, setEditImageUrl] = useState(repo.customImageUrl || "");

    const handleSave = async () => {
        try {
            const res = await fetch("/api/admin/repos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: repo.id,
                    customName: editName !== repo.name ? editName : undefined,
                    customDescription: editDescription !== repo.description ? editDescription : undefined,
                    imageSource: editImageSource,
                    customImageUrl: editImageSource === "custom" ? editImageUrl : null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                onUpdate({
                    name: editName,
                    description: editDescription,
                    imageSource: editImageSource as "github" | "custom" | "none",
                    customImageUrl: editImageSource === "custom" ? editImageUrl : null,
                });
                toast.success("Project updated!");
                onClose();
            } else {
                toast.error(data.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update project");
        }
    };

    const handleReset = async () => {
        try {
            const res = await fetch("/api/admin/repos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: repo.id,
                    customName: null,
                    customDescription: null,
                    imageSource: "github",
                    customImageUrl: null,
                }),
            });
            const data = await res.json();
            if (data.success && data.repo) {
                onUpdate({
                    name: data.repo.name,
                    description: data.repo.description,
                    imageSource: data.repo.imageSource ?? "github",
                    customImageUrl: data.repo.customImageUrl ?? null,
                });
                setEditName(data.repo.name);
                setEditDescription(data.repo.description || "");
                setEditImageSource(data.repo.imageSource ?? "github");
                setEditImageUrl("");
                toast.success("Reset to GitHub data!");
                onClose();
            } else {
                toast.error(data.error || "Failed to reset");
            }
        } catch {
            toast.error("Failed to reset project");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                    <h2 className="text-lg font-semibold">Edit Project</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                            Display Name
                        </label>
                        <input
                            id="edit-name"
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
                            placeholder="Custom display name"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                            Description
                        </label>
                        <textarea
                            id="edit-description"
                            rows={3}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent-cyan)] transition-colors resize-none"
                            placeholder="Custom description"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-image-source" className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                            <span className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Image Source
                            </span>
                        </label>
                        <select
                            id="edit-image-source"
                            value={editImageSource}
                            onChange={(e) => setEditImageSource(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
                        >
                            <option value="github">GitHub Preview</option>
                            <option value="custom">Custom URL</option>
                            <option value="none">No Image</option>
                        </select>
                    </div>
                    {editImageSource === "custom" && (
                        <div>
                            <label htmlFor="edit-image-url" className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
                                Custom Image URL
                            </label>
                            <input
                                id="edit-image-url"
                                type="text"
                                value={editImageUrl}
                                onChange={(e) => setEditImageUrl(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
                                placeholder="/my-image.png or https://..."
                            />
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 px-4 border border-[var(--border)] text-[var(--text-muted)] rounded-xl font-medium flex items-center justify-center gap-2 hover:border-[var(--accent-cyan)] hover:text-[var(--text)] transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 bg-[var(--accent-cyan)] text-[var(--accent-inverted)] rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
