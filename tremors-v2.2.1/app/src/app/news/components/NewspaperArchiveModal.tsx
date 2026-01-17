/**
 * NewspaperArchiveModal - Full-screen archive browser with month navigation
 * Features: Month arrow navigation, scroll-based lazy loading, admin controls
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Loader2, RotateCcw } from "lucide-react";

interface EditionSummary {
    id: string;
    date: string;
    createdAt: string; // Actual creation timestamp
    headline: string;
    isActive: boolean;
    isFallback: boolean;
}

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    editions: EditionSummary[];
    isAdmin: boolean;
    currentEditionId?: string; // The edition currently being viewed (may differ from active)
    onLoadEdition: (id: string) => void;
    onSetActive: (id: string) => void;
    onResetToActive?: () => void; // Reset to the active edition
}

// Get month/year from a date
function getMonthYear(dateStr: string): { month: number; year: number; label: string } {
    const date = new Date(dateStr);
    return {
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };
}

// Get unique months from editions
function getAvailableMonths(editions: EditionSummary[]): { month: number; year: number; label: string }[] {
    const seen = new Set<string>();
    return editions
        .map(e => getMonthYear(e.createdAt || e.date))
        .filter(my => {
            const key = `${my.year}-${my.month}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => {
            // Sort descending (newest first)
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
}

// Filter editions for a specific month
function getEditionsForMonth(editions: EditionSummary[], month: number, year: number, showFallbacks: boolean): EditionSummary[] {
    return editions
        .filter(e => {
            const d = new Date(e.createdAt || e.date);
            const monthMatch = d.getMonth() === month && d.getFullYear() === year;
            // Hide fallbacks from non-admins
            if (!showFallbacks && e.isFallback) return false;
            return monthMatch;
        })
        .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()); // Latest first
}

export function NewspaperArchiveModal({
    isOpen,
    onClose,
    editions,
    isAdmin,
    currentEditionId,
    onLoadEdition,
    onSetActive,
    onResetToActive
}: ArchiveModalProps) {
    // Filter editions - only show fallbacks to admin
    const visibleEditions = isAdmin ? editions : editions.filter(e => !e.isFallback);

    // Get available months from visible editions
    const availableMonths = getAvailableMonths(visibleEditions);

    // Current month index (0 = most recent)
    const [monthIndex, setMonthIndex] = useState(0);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Loading state for individual editions
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Ref for scroll container
    const scrollRef = useRef<HTMLDivElement>(null);

    // Find the ONLY active edition
    const activeEdition = visibleEditions.find(e => e.isActive);
    const activeEditionId = activeEdition?.id;

    // Check if user is viewing a different edition than the active one
    const isViewingDifferent = currentEditionId && currentEditionId !== activeEditionId;

    const currentMonth = availableMonths[monthIndex] || {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        label: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };

    const monthEditions = getEditionsForMonth(visibleEditions, currentMonth.month, currentMonth.year, isAdmin);

    // Show ALL editions for the month (no limit)
    const displayEditions = monthEditions;

    // Reset pagination logic removed since we show all
    const canGoPrev = monthIndex > 0;
    const canGoNext = monthIndex < availableMonths.length - 1;

    // Handle month change
    const handlePrev = useCallback(() => {
        if (canGoPrev) setMonthIndex(i => i - 1);
    }, [canGoPrev]);

    const handleNext = useCallback(() => {
        if (canGoNext) setMonthIndex(i => i + 1);
    }, [canGoNext]);

    const handleEditionClick = async (id: string) => {
        try {
            setLoadingId(id);
            await onLoadEdition(id);
            onClose();
        } catch (error) {
            console.error("Failed to load edition:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleSetActive = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setLoadingId(id);
            await onSetActive(id);
        } catch (error) {
            console.error("Failed to set active edition:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleReset = () => {
        if (onResetToActive) {
            onResetToActive();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[1000] p-5" onClick={onClose}>
            <div className="bg-[var(--np-paper)] max-w-[700px] w-full max-h-[85vh] overflow-y-auto p-0 border-[3px] border-solid border-[var(--np-ink)]" onClick={e => e.stopPropagation()}>
                {/* Header with month navigation */}
                <div className="flex items-center justify-center gap-4 p-5 border-b-[3px] border-double border-[var(--np-ink)] sticky top-0 bg-[var(--np-paper)] z-[1]">
                    <button
                        className="bg-none border border-[var(--np-ink)] w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200 text-[var(--np-ink)] hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)] disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={handlePrev}
                        disabled={!canGoPrev}
                        title="Newer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="font-display text-[1.5rem] font-bold uppercase tracking-[2px] min-w-[200px] text-center">{currentMonth.label}</h2>
                    <button
                        className="bg-none border border-[var(--np-ink)] w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200 text-[var(--np-ink)] hover:bg-[var(--np-ink)] hover:text-[var(--np-paper)] disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={handleNext}
                        disabled={!canGoNext}
                        title="Older"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[var(--np-ink)] p-2 transition-colors duration-200 hover:text-[var(--np-accent)]" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Edition count + Reset button */}
                <div className="flex items-center justify-between p-3 px-4 border-b border-[var(--np-rule)]">
                    <p className="text-[0.85rem] text-[var(--np-ink-light)] m-0">
                        {monthEditions.length} edition{monthEditions.length !== 1 ? "s" : ""} this month
                    </p>
                    {isViewingDifferent && onResetToActive && (
                        <button className="flex items-center gap-1.5 bg-[var(--np-accent)] text-[var(--np-paper)] border-none p-1.5 px-3 text-[0.75rem] font-inherit cursor-pointer transition-opacity duration-200 hover:opacity-85" onClick={handleReset}>
                            <RotateCcw className="w-3 h-3" />
                            Reset to Active
                        </button>
                    )}
                </div>

                {/* Scrollable editions grid */}
                <div className="max-h-[60vh] md:max-h-[60vh] overflow-y-auto" ref={scrollRef}>
                    {displayEditions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--np-rule)]">
                            {displayEditions.map((edition, idx) => {
                                // Use createdAt for accurate time
                                const dateObj = new Date(edition.createdAt || edition.date);
                                const dayKey = dateObj.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                });
                                const dayStr = dateObj.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    day: "numeric"
                                });
                                const timeStr = dateObj.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit"
                                });

                                // Check if this is a new day (different from previous)
                                const prevEdition = displayEditions[idx - 1];
                                const prevDayKey = prevEdition
                                    ? new Date(prevEdition.createdAt || prevEdition.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    : null;
                                const isNewDay = idx === 0 || dayKey !== prevDayKey;

                                // Only the REAL active edition gets the active styling
                                const isRealActive = edition.id === activeEditionId;

                                return (
                                    <React.Fragment key={edition.id}>
                                        {isNewDay && idx > 0 && (
                                            <div className="col-span-full bg-[var(--np-bg)] p-2 px-4 text-[0.75rem] font-bold uppercase tracking-widest text-[var(--np-paper)] border-t border-[var(--np-ink)] border-b border-[var(--np-rule)]">
                                                {dayKey}
                                            </div>
                                        )}
                                        <div
                                            className={`bg-[var(--np-paper)] p-4 cursor-pointer transition-all duration-200 relative hover:bg-[var(--np-bg)] hover:text-[var(--np-paper)] group ${isRealActive ? "bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border-l-[3px] border-solid border-[var(--np-accent)]" : ""} ${edition.isFallback ? "opacity-70" : ""}`}
                                            onClick={() => handleEditionClick(edition.id)}
                                        >
                                            <div className="text-[0.7rem] uppercase tracking-widest text-[var(--np-ink-light)] mb-1.5 flex items-center gap-2 group-hover:text-[var(--np-paper)]">
                                                {dayStr} • {timeStr}
                                                {edition.isFallback && <span className="bg-[var(--np-accent)] text-[var(--np-paper)] p-0.5 px-1.5 text-[0.6rem] uppercase">Fallback</span>}
                                            </div>
                                            <div className="text-[0.95rem] font-semibold leading-[1.4] line-clamp-2 overflow-hidden text-[var(--np-accent)]">
                                                {loadingId === edition.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                                ) : null}
                                                {edition.headline}
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    className={`absolute top-3 right-3 bg-[var(--np-ink)] text-[var(--np-paper)] border-none p-1 px-2.5 text-[0.7rem] font-inherit cursor-pointer transition-colors duration-200 hover:bg-[var(--np-accent)] ${isRealActive ? "bg-[var(--np-accent)]" : ""}`}
                                                    onClick={(e) => handleSetActive(edition.id, e)}
                                                >
                                                    {isRealActive ? <Check className="w-3 h-3" /> : "Use"}
                                                </button>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-[60px] px-5 text-center text-[var(--np-ink-light)] italic">
                            No editions for this month.
                        </div>
                    )}
                </div>

                {/* Admin-only Fallbacks Section */}
                {isAdmin && (() => {
                    const fallbackEditions = editions.filter(e => e.isFallback);
                    if (fallbackEditions.length === 0) return null;

                    return (
                        <div className="border-t-[3px] border-double border-[var(--np-ink)] bg-[color-mix(in_srgb,var(--np-accent)_5%,transparent)]">
                            <div className="p-2.5 px-4 text-[0.75rem] font-bold uppercase tracking-widest text-[var(--np-accent)] border-b border-[var(--np-rule)]">
                                Fallback Editions ({fallbackEditions.length})
                            </div>
                            <div className="flex flex-col">
                                {fallbackEditions.map(edition => {
                                    const dateObj = new Date(edition.createdAt || edition.date);
                                    const dateStr = dateObj.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric"
                                    });
                                    const isRealActive = edition.id === activeEditionId;

                                    return (
                                        <div
                                            key={edition.id}
                                            className={`flex items-center gap-3 p-2.5 px-4 border-b border-[var(--np-rule)] cursor-pointer transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--np-accent)_15%,transparent)] ${isRealActive ? "bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)]" : ""}`}
                                            onClick={() => handleEditionClick(edition.id)}
                                        >
                                            <span className="text-[0.7rem] text-[var(--np-ink-light)] min-w-[50px]">{dateStr}</span>
                                            <span className="flex-1 text-[0.85rem] whitespace-nowrap overflow-hidden text-ellipsis">{edition.headline}</span>
                                            <button
                                                className={`bg-[var(--np-ink)] text-[var(--np-paper)] border-none p-1 px-2.5 text-[0.7rem] font-inherit cursor-pointer transition-colors duration-200 hover:bg-[var(--np-accent)] ${isRealActive ? "bg-[var(--np-accent)]" : ""}`}
                                                onClick={(e) => handleSetActive(edition.id, e)}
                                            >
                                                {isRealActive ? <Check className="w-3 h-3" /> : "Use"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
