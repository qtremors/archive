/**
 * SkillsList Component - Reusable skills display
 * Uses SKILLS from config for centralized management
 */

"use client";

import { SKILLS } from "@/config/site";

interface SkillsListProps {
    variant?: "default" | "grouped" | "pills" | "inline";
    className?: string;
}

export function SkillsList({ variant = "default", className = "" }: SkillsListProps) {
    // Grouped - horizontal rows by category (for newspaper)
    if (variant === "grouped") {
        return (
            <div className={`space-y-3 ${className}`}>
                {SKILLS.map((category) => (
                    <div key={category.id} className="flex gap-3 flex-wrap items-baseline">
                        <span className="font-semibold text-xs uppercase tracking-wide text-[var(--accent-cyan)]">
                            {category.label}:
                        </span>
                        <span>{category.skills.join(" • ")}</span>
                    </div>
                ))}
            </div>
        );
    }

    // Inline - comma-separated list (for paper mode)
    if (variant === "inline") {
        return (
            <div className={`flex flex-wrap gap-2 ${className}`}>
                {SKILLS.flatMap((category) =>
                    category.skills.map((skill) => (
                        <span
                            key={`${category.id}-${skill}`}
                            className="px-3 py-1 text-sm border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)]"
                        >
                            {skill}
                        </span>
                    ))
                )}
            </div>
        );
    }

    // Pills - small tag-style (for default page hero/about)
    if (variant === "pills") {
        return (
            <div className={`flex flex-wrap gap-2 ${className}`}>
                {SKILLS.flatMap((category) =>
                    category.skills.map((skill) => (
                        <span
                            key={`${category.id}-${skill}`}
                            className="px-2 py-0.5 text-xs border border-[var(--border)] rounded-full text-[var(--text-muted)]"
                        >
                            {skill}
                        </span>
                    ))
                )}
            </div>
        );
    }

    // Default - grouped with headings
    return (
        <div className={`space-y-4 ${className}`}>
            {SKILLS.map((category) => (
                <div key={category.id}>
                    <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                        {category.label}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill) => (
                            <span
                                key={skill}
                                className="px-3 py-1 text-sm border border-[var(--border)] rounded-md bg-[var(--bg-secondary)]"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
