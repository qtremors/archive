/**
 * Newspaper Mode - Editorial/Print-inspired Design
 * Masthead, activity ticker, two-column layout, data tables
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { ModeProps } from "@/types";
import { PERSONAL, SKILLS, NEWS_AGENT } from "@/config/site";
import { ContactLinks } from "@/components/ContactLinks";
import { useTheme } from "@/components/ThemeProvider";
import { useAdmin } from "@/components/AdminContext";
import { useFetch } from "@/hooks/useFetch";
import { Sun, Moon, GitCommit, Star, GitBranch, GitPullRequest, Rocket, ChevronDown, Loader2, RefreshCw, Calendar, Rss, Settings2 } from "lucide-react";
import { NewspaperArchiveModal } from "./components/NewspaperArchiveModal";
import { PersonalitySettingsModal } from "./components/PersonalitySettingsModal";
import { NewspaperHeader } from "./components/NewspaperHeader";
import { ActivityTicker } from "./components/ActivityTicker";
import { EditionArticle } from "./components/EditionArticle";
import { NewspaperStats } from "./components/NewspaperStats";
import { ProjectsTable } from "./components/ProjectsTable";
import { TechnicalProficiencies } from "./components/TechnicalProficiencies";
import { formatIST } from "@/lib/date";
import { formatProjectTitle } from "@/lib/utils";
// newspaper.css migrated to tailwind

// Types for AI-generated content
interface NewspaperEdition {
    id: string;
    date: string;
    headline: string;
    subheadline: string;
    bodyContent: string[];
    pullQuote: string;
    location: string;
    isFallback: boolean;
    generatedBy: string | null;
    agentName?: string;
    personality?: string;
}

interface EditionSummary {
    id: string;
    date: string;
    createdAt: string;
    headline: string;
    isActive: boolean;
    isFallback: boolean;
}

export function NewspaperPage({ data }: ModeProps) {
    const { repos, activity, user, error } = data;
    const { theme, toggleTheme } = useTheme();
    const { isAdmin } = useAdmin();

    // State for live commit count
    const [totalCommits, setTotalCommits] = useState<number | null>(null);

    // State for AI-generated content
    const [edition, setEdition] = useState<NewspaperEdition | null>(null);
    const [editions, setEditions] = useState<EditionSummary[]>([]);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showArchive, setShowArchive] = useState(false);

    // AI Personality State
    const [showSettings, setShowSettings] = useState(false);
    const [selectedPersonality, setSelectedPersonality] = useState("tabloid");

    // State for show more projects
    const [showMoreProjects, setShowMoreProjects] = useState(false);

    // API Data Fetching with Hooks
    const { data: statsData, loading: isLoadingCommits } = useFetch<{ totalCommits: number }>("/api/stats/commits");
    const {
        data: activeEdition,
        loading: isLoadingContent,
        refetch: refetchContent
    } = useFetch<NewspaperEdition>("/api/newspaper/generate");
    const { data: editionsData } = useFetch<{ editions: EditionSummary[] }>("/api/newspaper/editions");

    // Sync stats data
    useEffect(() => {
        if (statsData) setTotalCommits(statsData.totalCommits);
    }, [statsData]);

    // Sync active edition and personality
    useEffect(() => {
        if (activeEdition) {
            setEdition(activeEdition);
            if (activeEdition.personality) {
                setSelectedPersonality(activeEdition.personality);
            }
        }
    }, [activeEdition]);

    // Sync editions list
    useEffect(() => {
        if (editionsData) setEditions(editionsData.editions);
    }, [editionsData]);

    // Close archive/settings on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                if (showArchive) setShowArchive(false);
                if (showSettings) setShowSettings(false);
            }
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [showArchive, showSettings]);

    // Load specific edition
    const loadEdition = async (id: string) => {
        try {
            const res = await fetch(`/api/newspaper/generate?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setEdition(data);
                if (data.personality) setSelectedPersonality(data.personality);
            }
        } catch (err) {
            console.error("Failed to load edition:", err);
        }
        setShowArchive(false);
    };

    // Regenerate content (admin only)
    const regenerateContent = async () => {
        setIsRegenerating(true);
        try {
            const res = await fetch("/api/newspaper/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ personalityId: selectedPersonality })
            });
            if (res.ok) {
                const data = await res.json();
                setEdition(data);
                // Refresh editions list
                const editionsRes = await fetch("/api/newspaper/editions");
                if (editionsRes.ok) {
                    const editionsData = await editionsRes.json();
                    setEditions(editionsData.editions);
                }
            }
        } catch (err) {
            console.error("Failed to regenerate:", err);
        } finally {
            setIsRegenerating(false);
        }
    };

    // Set edition as active (admin only)
    const setActiveEdition = async (id: string) => {
        try {
            const res = await fetch("/api/newspaper/active", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ editionId: id }),
            });
            if (res.ok) {
                // Refresh editions list to show new active state
                const editionsRes = await fetch("/api/newspaper/editions");
                if (editionsRes.ok) {
                    const data = await editionsRes.json();
                    setEditions(data.editions);
                }
                // Reload the active edition
                const contentRes = await fetch("/api/newspaper/generate");
                if (contentRes.ok) {
                    const data = await contentRes.json();
                    setEdition(data);
                }
            }
        } catch (err) {
            console.error("Failed to set active:", err);
        }
        setShowArchive(false);
    };

    if (error) {
        return <div className="font-serif bg-[var(--np-bg)] text-[var(--np-ink)] min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    }

    // Get visible repos (filter hidden ones)
    const visibleRepos = repos.filter(r => !r.hidden);
    const featuredRepos = visibleRepos.filter(r => r.featured).slice(0, 8);
    const displayRepos = featuredRepos.length > 0 ? featuredRepos : visibleRepos.slice(0, 8);
    const otherRepos = visibleRepos.filter(r => !r.featured);

    // Format date in IST
    const dateStr = formatIST(new Date(), {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Calculate stats
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    return (
        <div className="font-serif bg-[var(--np-bg)] bg-none text-[var(--np-ink)] leading-[1.7] text-[18px] min-h-screen selection:bg-[var(--np-accent)] selection:text-[var(--np-paper)]">
            <div className="max-w-[1100px] mx-auto bg-[var(--np-paper)] min-h-screen px-6 md:px-[60px] py-10 pt-16 md:pt-10">
                <NewspaperHeader
                    dateStr={dateStr}
                    isAdmin={isAdmin}
                    isRegenerating={isRegenerating}
                    selectedPersonality={selectedPersonality}
                    theme={theme}
                    onShowArchive={() => setShowArchive(true)}
                    onRegenerate={regenerateContent}
                    onShowSettings={() => setShowSettings(true)}
                    onToggleTheme={toggleTheme}
                />

                <ActivityTicker activity={data.recentActivity} />

                <EditionArticle edition={edition} isLoading={isLoadingContent} />

                <NewspaperStats
                    repoCount={user?.public_repos || repos.length}
                    totalCommits={totalCommits}
                    isLoadingCommits={isLoadingCommits}
                />

                <ProjectsTable
                    displayRepos={displayRepos}
                    otherRepos={otherRepos}
                    showMoreProjects={showMoreProjects}
                    onToggleShowMore={() => setShowMoreProjects(!showMoreProjects)}
                    formatProjectTitle={formatProjectTitle}
                />

                <TechnicalProficiencies />

                {/* Correspondence */}
                <div className="mt-12 pt-8 border-t-[3px] border-double border-[var(--np-ink)] text-center">
                    <h2 className="font-display text-[1.5rem] mb-4">Correspondence</h2>
                    <p>For inquiries regarding positions, collaborations, or just to say hello:</p>
                    <ContactLinks variant="icons-only" className="flex justify-center gap-6 flex-wrap mt-4" />
                </div>

                <footer className="mt-12 pt-6 border-t border-[var(--np-rule)] text-center text-[0.8rem] text-[var(--np-ink-light)]">
                    <p>© {formatIST(new Date(), { year: "numeric" })} The Tremors Chronicle. All Rights Reserved.</p>
                </footer>
            </div>

            {/* Archive Modal */}
            <NewspaperArchiveModal
                isOpen={showArchive}
                onClose={() => setShowArchive(false)}
                editions={editions}
                isAdmin={isAdmin}
                currentEditionId={edition?.id}
                onLoadEdition={loadEdition}
                onSetActive={setActiveEdition}
                onResetToActive={async () => {
                    // Reload the active edition from server
                    try {
                        const res = await fetch("/api/newspaper/generate");
                        if (res.ok) {
                            const data = await res.json();
                            setEdition(data);
                        }
                    } catch (err) {
                        console.error("Failed to reset:", err);
                    }
                }}
            />

            {/* Personality Settings Modal */}
            <PersonalitySettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                selectedPersonalityId={selectedPersonality}
                onSelectPersonality={setSelectedPersonality}
            />
        </div>
    );
}
