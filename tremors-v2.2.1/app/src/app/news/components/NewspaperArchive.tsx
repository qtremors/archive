/**
 * NewspaperArchive - Archive dropdown for newspaper editions
 * A-001: Extracted from NewspaperPage.tsx
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { Calendar, Folder, FolderOpen, Check, ChevronRight } from "lucide-react";

interface EditionSummary {
    id: string;
    date: string;
    headline: string;
    isActive: boolean;
    isFallback: boolean;
}

interface ArchiveProps {
    editions: EditionSummary[];
    isOpen: boolean;
    onToggle: () => void;
    onSelectEdition: (id: string) => void;
    currentEditionId?: string;
}

export function NewspaperArchive({ editions, isOpen, onToggle, onSelectEdition, currentEditionId }: ArchiveProps) {
    const archiveRef = useRef<HTMLDivElement>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (archiveRef.current && !archiveRef.current.contains(event.target as Node)) {
                onToggle();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onToggle]);

    // Toggle folder expansion
    const toggleFolder = (dateKey: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(dateKey)) {
                next.delete(dateKey);
            } else {
                next.add(dateKey);
            }
            return next;
        });
    };

    // Group editions by month
    const groupedEditions = editions.reduce((acc, ed) => {
        const date = new Date(ed.date);
        const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(ed);
        return acc;
    }, {} as Record<string, EditionSummary[]>);

    return (
        <div className="np-archive-wrapper" ref={archiveRef}>
            <button onClick={onToggle} className="np-control-btn">
                <Calendar className="w-4 h-4" />
                Archive
            </button>
            {isOpen && editions.length > 0 && (
                <div className="np-archive-dropdown">
                    <div className="np-archive-header">Past Editions</div>
                    {Object.entries(groupedEditions).map(([monthKey, monthEditions]) => {
                        const isExpanded = expandedFolders.has(monthKey);
                        return (
                            <div key={monthKey} className="np-archive-folder">
                                <button
                                    className="np-archive-folder-header"
                                    onClick={() => toggleFolder(monthKey)}
                                >
                                    {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                                    <span>{monthKey}</span>
                                    <span className="np-archive-count">{monthEditions.length}</span>
                                    <ChevronRight className={`w-3 h-3 np-chevron ${isExpanded ? "np-chevron-open" : ""}`} />
                                </button>
                                {isExpanded && (
                                    <div className="np-archive-folder-items">
                                        {monthEditions.map(ed => {
                                            const edDate = new Date(ed.date);
                                            return (
                                                <button
                                                    key={ed.id}
                                                    onClick={() => onSelectEdition(ed.id)}
                                                    className={`np-archive-item ${ed.id === currentEditionId ? "np-archive-item-active" : ""}`}
                                                >
                                                    <span className="np-archive-item-date">
                                                        {edDate.getDate()}
                                                    </span>
                                                    <span className="np-archive-item-headline">
                                                        {ed.headline.slice(0, 40)}...
                                                    </span>
                                                    {ed.id === currentEditionId && (
                                                        <Check className="w-3 h-3 np-archive-check" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
