/**
 * TechnicalProficiencies - Skills grid for Newspaper mode
 */

"use client";

import { SKILLS } from "@/config/site";

export function TechnicalProficiencies() {
    return (
        <>
            <h3 className="font-display text-[1.25rem] uppercase tracking-[2px] mt-12 border-b border-[var(--np-ink)] pb-2">Technical Proficiencies</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 my-6 py-4 bg-[color-mix(in_srgb,var(--np-ink)_3%,transparent)] border border-[var(--np-rule)]">
                {SKILLS.map((category) => (
                    <div key={category.id} className="px-4 text-center relative border-r border-dotted border-[var(--np-rule)] lg:border-r md:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(5n)]:border-r-0 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r">
                        <h4 className="font-display text-[0.85rem] font-bold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[var(--np-accent)] text-[var(--np-ink)]">{category.label}</h4>
                        <ul className="list-none m-0 p-0">
                            {category.skills.map((skill, idx) => (
                                <li key={idx} className="py-1.5 text-[0.85rem] text-[var(--np-ink)]">{skill}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
}
