/**
 * Default Mode
 * Modern, clean layout with animated hero and cards
 */

"use client";

import type { ModeProps } from "@/types";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { HeroSection, SkillsSection, ActivitySection } from "@/components/sections";
import { Footer } from "@/components/Footer";

export function DefaultPage({ data }: ModeProps) {
    const { repos, recentActivity, error } = data;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-[var(--text-muted)]">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-6xl mx-auto px-6 py-16 pb-24">
                <HeroSection />

                {/* Projects */}
                <section id="projects" className="mb-24">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-bold">Projects</h2>
                        <span className="flex-1 h-px bg-[var(--border)]" />
                    </div>
                    <ProjectsGrid repos={repos} />
                </section>

                <SkillsSection />
                <ActivitySection activity={recentActivity} />
            </div>
            <Footer />
        </>
    );
}

