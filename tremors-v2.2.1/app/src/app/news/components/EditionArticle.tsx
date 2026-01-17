/**
 * EditionArticle - Main AI-generated story for Newspaper mode
 */

"use client";

import { PERSONAL } from "@/config/site";

interface Edition {
    id: string;
    headline: string;
    subheadline: string;
    bodyContent: string[];
    pullQuote: string;
    location: string;
}

interface EditionArticleProps {
    edition: Edition | null;
    isLoading: boolean;
}

export function EditionArticle({ edition, isLoading }: EditionArticleProps) {
    return (
        <div className="space-y-6">
            {/* Main Headline */}
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] mt-12 mb-6 border-b-2 border-[var(--np-ink)] pb-3">
                {isLoading ? (
                    <span className="inline-block w-3/4 h-10 bg-current opacity-10 animate-pulse rounded" />
                ) : (
                    edition?.headline || "Local Developer Builds AI-Powered Platforms, Refuses to Stop Pushing Commits"
                )}
            </h2>

            {/* Subheadline */}
            <p className="font-display text-[1.5rem] font-normal italic mb-8 text-[var(--np-ink-light)]">
                {isLoading ? (
                    <span className="inline-block w-2/3 h-6 bg-current opacity-10 animate-pulse rounded" />
                ) : (
                    edition?.subheadline || `${PERSONAL.name}, known online as "${PERSONAL.handle}," continues his relentless pursuit of cleaner code and smarter applications`
                )}
            </p>

            <div className="text-[0.85rem] uppercase tracking-[2px] mb-6 flex justify-between flex-wrap gap-2">
                <span>
                    <span className="text-[var(--np-accent)] font-semibold">{PERSONAL.name.toUpperCase()}</span> • {PERSONAL.tagline}
                </span>
                <span>📍 {edition?.location || "VØID"}</span>
            </div>

            {/* Main Content Body */}
            <div className="columns-1 md:columns-2 gap-10 [column-rule:1px_solid_var(--np-rule)] [&_p]:mb-[1.5em] [&_p]:text-justify [&_p]:[hyphens:auto] [&_p:first-of-type::first-letter]:font-display [&_p:first-of-type::first-letter]:text-[4rem] [&_p:first-of-type::first-letter]:float-left [&_p:first-of-type::first-letter]:leading-[0.8] [&_p:first-of-type::first-letter]:pr-3 [&_p:first-of-type::first-letter]:text-[var(--np-accent)]">
                {edition?.bodyContent ? (
                    <>
                        {edition.bodyContent.map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                        <div className="[break-inside:avoid] border-l-4 border-[var(--np-accent)] px-6 py-4 my-6 text-[1.3rem] italic font-display">
                            {edition.pullQuote}
                        </div>
                    </>
                ) : (
                    <>
                        <p>
                            In a world increasingly dominated by AI assistants and automated workflows, one developer has made it his
                            mission to bridge the gap between traditional web engineering and cutting-edge language models. {PERSONAL.name},
                            a Computer Science graduate and self-proclaimed "{PERSONAL.tagline}," has been quietly building an impressive
                            portfolio of projects that span from quiz platforms to music players.
                        </p>
                        <p>
                            "I fell in love with Python," {PERSONAL.name.split(" ")[0]} explains, "and I never looked back. There's an elegance to it that
                            just makes sense." His focus on the Django and FastAPI ecosystems has led to the creation of numerous
                            production-ready applications, each demonstrating a deep understanding of backend architecture and
                            real-time web features.
                        </p>
                        <div className="[break-inside:avoid] border-l-4 border-[var(--np-accent)] px-6 py-4 my-6 text-[1.3rem] italic font-display">
                            "I believe in writing code that's not just functional, but clean, efficient, and maintainable."
                        </div>
                        <p>
                            Beyond application development, {PERSONAL.name.split(" ")[0]} has demonstrated a penchant for developer tooling—creating CLIs for
                            Git visualization, remote control APIs for system management, and even a custom Terminal UI for his
                            portfolio. "I appreciate the details of how software interacts with the underlying system," he notes.
                        </p>
                        <p>
                            Currently, {PERSONAL.name.split(" ")[0]} is exploring the intersection of traditional web engineering and LLM capabilities, with
                            the goal of creating "smarter applications" that adapt to user needs in real-time.
                            {PERSONAL.availableForWork && " His status: actively seeking new opportunities."}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
