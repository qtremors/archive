/**
 * Paper Mode - Reading/Document Style
 * Paper textured background with serif typography
 * Sidebar TOC + Main content area
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ModeProps } from "@/types";
import { PERSONAL, SKILLS, RESUME } from "@/config/site";
import { Download, Upload, Check, List } from "lucide-react";
import { ContactLinks } from "@/components/ContactLinks";
import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/ToastProvider";
import { formatProjectTitle } from "@/lib/utils";
// resume.css migrated to tailwind

// Table of contents sections
const sections = [
    { id: "intro", label: "Intro" },
    { id: "about", label: "About Me" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
    { id: "contact", label: "Contact" },
] as const;

// Initial visible projects count
const INITIAL_PROJECTS = 5;

export function PaperPage({ data }: ModeProps) {
    const { repos, error } = data;
    const { isAdmin, editMode } = useAdmin();
    const toast = useToast();
    const [activeSection, setActiveSection] = useState("intro");
    const [visibleProjects, setVisibleProjects] = useState(INITIAL_PROJECTS);
    const [showAllProjects, setShowAllProjects] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Resume upload state
    const [resumeUrl, setResumeUrl] = useState("/Aman_Singh.pdf");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editable resume content state
    const [summary, setSummary] = useState<string>(RESUME.summary);
    const [about, setAbout] = useState<string[]>([...RESUME.about]);

    // Fetch current settings including resume content
    useEffect(() => {
        Promise.allSettled([
            fetch("/api/admin/resume").then(r => r.json()),
            fetch("/api/admin/settings").then(r => r.json()),
        ]).then((results) => {
            // Handle Resume Result
            if (results[0].status === 'fulfilled') {
                const resumeData = results[0].value;
                if (resumeData.url) setResumeUrl(resumeData.url);
            } else {
                console.error("Failed to fetch resume URL:", results[0].reason);
            }

            // Handle Settings Result
            if (results[1].status === 'fulfilled') {
                const settingsData = results[1].value;
                if (settingsData.settings?.resumeSummary) {
                    setSummary(settingsData.settings.resumeSummary);
                }
                if (settingsData.settings?.resumeAbout) {
                    try {
                        const parsed = JSON.parse(settingsData.settings.resumeAbout);
                        if (Array.isArray(parsed)) setAbout(parsed);
                    } catch { /* Use default */ }
                }
            } else {
                console.error("Failed to fetch settings:", results[1].reason);
            }
        });
    }, []);

    // Handle file upload
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/resume", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success && data.url) {
                setResumeUrl(data.url);
                toast.success("Resume uploaded successfully!");
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Save resume content to database
    const saveResumeContent = async (newSummary?: string, newAbout?: string[]) => {
        try {
            const body: Record<string, string> = {};
            if (newSummary !== undefined) body.resumeSummary = newSummary;
            if (newAbout !== undefined) body.resumeAbout = JSON.stringify(newAbout);

            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Saved!");
            } else {
                toast.error(data.error || "Save failed");
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Save failed");
        }
    };

    if (error) {
        return <div className="font-serif text-[18px] leading-[1.8] text-[var(--paper-text)] bg-[var(--paper-bg)] min-h-screen [background-image:var(--paper-texture)] flex items-center justify-center text-red-600">{error}</div>;
    }

    // Track scroll position to update active section
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Find the entry with highest intersection ratio
                const visibleEntries = entries.filter(e => e.isIntersecting);
                if (visibleEntries.length > 0) {
                    // Get the one closest to top of viewport
                    const topEntry = visibleEntries.reduce((prev, curr) =>
                        prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
                    );
                    setActiveSection(topEntry.target.id);
                }
            },
            {
                rootMargin: "-80px 0px -60% 0px", // Account for header, activate when entering top 40%
                threshold: 0
            }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Get visible repos (filter hidden ones)
    const visibleRepos = repos.filter(r => !r.hidden);
    const displayedRepos = showAllProjects ? visibleRepos : visibleRepos.slice(0, visibleProjects);
    const hasMoreProjects = visibleRepos.length > visibleProjects && !showAllProjects;

    return (
        <div className="font-serif text-[18px] leading-[1.8] text-[var(--paper-text)] bg-[var(--paper-bg)] min-h-screen [background-image:var(--paper-texture)] pb-20 md:pb-0">
            <div className="flex min-h-screen max-w-[1000px] mx-auto px-4 md:px-8 pt-16 md:pt-0">
                {/* TOC Sidebar - Desktop only */}
                <aside className="sticky top-24 w-[180px] h-fit shrink-0 mr-8 hidden lg:block">
                    {/* Hidden file input for upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,application/pdf"
                        onChange={handleUpload}
                        style={{ display: "none" }}
                    />

                    {isAdmin ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center justify-center gap-2 p-3 px-4 mb-8 text-[var(--paper-muted)] no-underline uppercase tracking-wider font-semibold border border-[var(--paper-border)] rounded-md transition-all duration-200 hover:bg-[var(--paper-accent)] hover:border-[var(--paper-accent)] hover:text-[var(--paper-bg)] text-[0.8rem] whitespace-nowrap group"
                        >
                            {isUploading ? (
                                <Upload className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 transition-colors group-hover:text-[var(--paper-bg)]" />
                            )}
                            <span className="transition-colors group-hover:text-[var(--paper-bg)]">
                                {isUploading ? "Uploading..." : "Upload Resume"}
                            </span>
                        </button>
                    ) : (
                        <a
                            href={resumeUrl}
                            download="Aman_Singh.pdf"
                            className="flex items-center justify-center gap-2 p-3 px-4 mb-8 text-[var(--paper-muted)] no-underline uppercase tracking-wider font-semibold border border-[var(--paper-border)] rounded-md transition-all duration-200 hover:bg-[var(--paper-accent)] hover:border-[var(--paper-accent)] hover:text-[var(--paper-bg)] text-[0.8rem] whitespace-nowrap group"
                        >
                            <Download className="w-4 h-4 transition-colors group-hover:text-[var(--paper-bg)]" />
                            <span className="transition-colors group-hover:text-[var(--paper-bg)]">Download PDF</span>
                        </a>
                    )}

                    <nav className="flex flex-col gap-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`block p-3 px-4 text-[var(--paper-accent)] no-underline text-[1rem] rounded-md transition-all duration-200 font-medium text-left w-full bg-none border-none cursor-pointer hover:text-[var(--paper-text)] hover:bg-[var(--paper-highlight)] ${activeSection === section.id ? "text-[var(--paper-accent)] bg-[var(--paper-highlight)] font-semibold border-l-4 border-solid border-[var(--paper-accent)] rounded-lg pl-4" : ""}`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <main className="max-w-[720px] py-8 md:py-16 px-4 md:px-8">
                        {/* INTRO */}
                        <section id="intro" className="mb-12 scroll-mt-[100px]">
                            <h1 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[2.5rem] border-b-2 border-solid border-[var(--paper-border)] pb-2 mb-8">{PERSONAL.name}</h1>
                            <p className="mb-6 text-justify [hyphens:auto]"><strong>{PERSONAL.tagline}</strong></p>
                            <p
                                contentEditable={isAdmin && editMode}
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    if (isAdmin && editMode) {
                                        const newText = e.currentTarget.textContent || "";
                                        if (newText !== summary) {
                                            setSummary(newText);
                                            saveResumeContent(newText, undefined);
                                        }
                                    }
                                }}
                                className={`mb-6 text-justify [hyphens:auto] ${isAdmin && editMode ? "outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 rounded cursor-text" : ""}`}
                                style={isAdmin && editMode ? { minHeight: "1em" } : undefined}
                            >
                                {summary}
                            </p>
                        </section>

                        {/* ABOUT */}
                        <section id="about" className="mb-12 scroll-mt-[100px]">
                            <h2 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.75rem] mt-12 mb-6 border-b border-solid border-[var(--paper-border)] pb-2">About Me</h2>
                            {about.map((paragraph, i) => (
                                <p
                                    key={i}
                                    contentEditable={isAdmin && editMode}
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                        if (isAdmin && editMode) {
                                            const newText = e.currentTarget.textContent || "";
                                            if (newText !== about[i]) {
                                                const newAbout = [...about];
                                                newAbout[i] = newText;
                                                setAbout(newAbout);
                                                saveResumeContent(undefined, newAbout);
                                            }
                                        }
                                    }}
                                    className={`mb-6 text-justify [hyphens:auto] ${isAdmin && editMode ? "outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 rounded cursor-text" : ""}`}
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </section>

                        {/* EDUCATION */}
                        <section id="education" className="mb-12 scroll-mt-[100px]">
                            <h2 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.75rem] mt-12 mb-6 border-b border-solid border-[var(--paper-border)] pb-2">Education</h2>
                            {RESUME.education.map((edu, i) => (
                                <div key={i} className="mb-6 pb-6 border-b border-dashed border-[var(--paper-border)] last:mb-0 last:pb-0 last:border-b-0">
                                    <h3 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.25rem] mt-6">{edu.institution}</h3>
                                    <p className="mb-6 text-justify [hyphens:auto]"><strong>{edu.degree}</strong></p>
                                    <p className="mb-6 text-justify [hyphens:auto]">CGPA: {edu.cgpa} • Graduation: {edu.graduation}</p>
                                </div>
                            ))}
                        </section>

                        {/* EXPERIENCE */}
                        <section id="experience" className="mb-12 scroll-mt-[100px]">
                            <h2 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.75rem] mt-12 mb-6 border-b border-solid border-[var(--paper-border)] pb-2">Experience</h2>
                            {RESUME.experience.map((exp, i) => (
                                <div key={i} className="mb-6 pb-6 border-b border-dashed border-[var(--paper-border)] last:mb-0 last:pb-0 last:border-b-0">
                                    <h3 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.25rem] mt-6">{exp.title}</h3>
                                    <p className="mb-6 text-justify [hyphens:auto]"><strong>{exp.company}</strong>, {exp.location}</p>
                                    <p className="text-[var(--paper-muted)] italic text-[0.95rem] mb-2">{exp.period}</p>
                                    <ul className="list-disc pl-6 my-2 [&_li]:mb-2 [&_li]:text-left last:[&_li]:mb-0">
                                        {exp.bullets.map((bullet, j) => (
                                            <li key={j}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>

                        {/* SKILLS */}
                        <section id="skills" className="mb-12 scroll-mt-[100px]">
                            <h2 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.75rem] mt-12 mb-6 border-b border-solid border-[var(--paper-border)] pb-2 text-left">Technical Skills</h2>
                            {SKILLS.map((category) => (
                                <div key={category.id}>
                                    <h3 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.25rem] mt-6">{category.label}</h3>
                                    <ul className="flex flex-wrap gap-3 list-none p-0 my-4 mb-6">
                                        {category.skills.map((skill) => (
                                            <li key={skill} className="bg-[var(--paper-highlight)] border border-solid border-[var(--paper-border)] p-1.5 px-3 rounded-md text-[0.9rem]">{skill}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>

                        {/* PROJECTS */}
                        <section id="projects" className="mb-12 scroll-mt-[100px]">
                            <h2 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.75rem] mt-12 mb-6 border-b border-solid border-[var(--paper-border)] pb-2 text-left">Projects</h2>
                            {displayedRepos.map((repo) => (
                                <div key={repo.id} className="mb-6 pb-6 border-b border-dashed border-[var(--paper-border)] last:mb-0 last:pb-0 last:border-b-0">
                                    <h3 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.25rem] mt-6">{formatProjectTitle(repo.name)}</h3>
                                    <p className="mb-6 text-justify [hyphens:auto]">{repo.description || "No description available."}</p>
                                    <p className="mb-6 text-justify [hyphens:auto]">
                                        {repo.homepage && (
                                            <>
                                                <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-[var(--paper-accent)] underline decoration-1 underline-offset-2 transition-opacity duration-200 hover:opacity-80">Website</a>
                                                {" • "}
                                            </>
                                        )}
                                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-[var(--paper-accent)] underline decoration-1 underline-offset-2 transition-opacity duration-200 hover:opacity-80">GitHub</a>
                                    </p>
                                </div>
                            ))}

                            {hasMoreProjects && (
                                <button
                                    onClick={() => {
                                        const firstNewIndex = visibleProjects;
                                        setShowAllProjects(true);
                                        // Scroll to the first newly revealed project
                                        setTimeout(() => {
                                            const projectEntries = document.querySelectorAll('#projects > div');
                                            if (projectEntries[firstNewIndex]) {
                                                projectEntries[firstNewIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }, 50);
                                    }}
                                    className="block mx-auto my-8 p-3 px-6 font-serif text-[1rem] text-[var(--paper-accent)] bg-transparent border border-solid border-[var(--paper-accent)] rounded transition-all duration-200 hover:bg-[var(--paper-accent)] hover:text-[var(--paper-bg)] cursor-pointer"
                                >
                                    Load More Projects...
                                </button>
                            )}

                            {showAllProjects && visibleRepos.length > INITIAL_PROJECTS && (
                                <button
                                    onClick={() => {
                                        // Standard collapse: scroll to section header first, then collapse
                                        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        // Delay collapse until scroll animation completes
                                        setTimeout(() => {
                                            setShowAllProjects(false);
                                        }, 300);
                                    }}
                                    className="block mx-auto my-8 p-3 px-6 font-serif text-[1rem] text-[var(--paper-accent)] bg-transparent border border-solid border-[var(--paper-accent)] rounded transition-all duration-200 hover:bg-[var(--paper-accent)] hover:text-[var(--paper-bg)] cursor-pointer"
                                >
                                    Show Less
                                </button>
                            )}
                        </section>

                        {/* CERTIFICATIONS */}
                        <section id="certifications" className="mb-12 scroll-mt-[100px]">
                            <h2 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.75rem] mt-12 mb-6 border-b border-solid border-[var(--paper-border)] pb-2 text-left">Certifications</h2>
                            <ul className="list-none p-0 m-0">
                                {RESUME.certifications.map((cert, i) => (
                                    <li key={i} className="py-3 border-b border-dashed border-[var(--paper-border)] last:border-b-0">
                                        <strong className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-inherit">{cert.name}</strong> – {cert.issuer} – {cert.date}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* CONTACT */}
                        <section id="contact" className="mb-12 scroll-mt-[100px]">
                            <h2 className="font-serif font-semibold text-[var(--paper-text)] mb-4 text-[1.75rem] mt-12 mb-6 border-b border-solid border-[var(--paper-border)] pb-2 text-left">Contact</h2>
                            <p className="mb-6 text-justify [hyphens:auto]">Interested in working together? Feel free to reach out:</p>
                            <ContactLinks variant="paper" className="list-none p-0" />

                            {PERSONAL.availableForWork && (
                                <div className="inline-flex items-center gap-2 mt-4 p-2 px-4 bg-green-500/10 border border-solid border-green-500/30 rounded-md text-[#16a34a] text-[0.9rem]">
                                    <Check className="w-4 h-4" />
                                    <span>Available for new opportunities</span>
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            {/* Mobile Actions Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t p-4 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] bg-[var(--paper-bg)] border-[var(--paper-border)]">
                <a
                    href={resumeUrl}
                    download="Aman_Singh.pdf"
                    className="flex-1 flex items-center justify-center gap-2 p-3 no-underline uppercase tracking-wider rounded-md text-sm transition-all border border-[var(--paper-border)] text-[var(--paper-muted)] font-bold active:scale-[0.98] hover:bg-[var(--paper-accent)] hover:border-[var(--paper-accent)] hover:text-[var(--paper-bg)] group"
                >
                    <Download className="w-4 h-4 transition-colors group-hover:text-[var(--paper-bg)]" />
                    <span className="transition-colors group-hover:text-[var(--paper-bg)]">Download PDF</span>
                </a>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center justify-center p-3 px-4 border rounded-md transition-colors bg-transparent border-[var(--paper-border)] text-[var(--paper-muted)]"
                >
                    <List className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Section Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--paper-bg)] rounded-t-2xl p-6 pb-24 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-display text-xl font-bold uppercase tracking-widest text-[var(--paper-muted)]">Jump to Section</h3>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--paper-muted)]">
                                    <Check className="w-6 h-6" />
                                </button>
                            </div>
                            <nav className="grid grid-cols-2 gap-3">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            scrollToSection(section.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`p-3 px-4 text-left rounded-lg text-sm transition-all ${activeSection === section.id
                                            ? "bg-[var(--paper-highlight)] text-[var(--paper-accent)] border border-[var(--paper-accent)] font-bold shadow-sm"
                                            : "bg-[var(--paper-highlight)]/50 text-[var(--paper-muted)] border border-transparent"
                                            }`}
                                    >
                                        {section.label}
                                    </button>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
