/**
 * Footer - Site footer with navigation, social links, and contact modal
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { PERSONAL, CONTACT_LINKS } from "@/config/site";
import { Terminal, FileText, Newspaper, Rocket, Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import { ContactModal } from "./ContactModal";

const modes = [
    { id: "terminal", label: "Terminal", href: "/terminal", icon: Terminal },
    { id: "resume", label: "Resume", href: "/resume", icon: FileText },
    { id: "news", label: "News", href: "/news", icon: Newspaper },
    { id: "nexus", label: "Nexus", href: "/nexus", icon: Rocket },
];

const getContactUrl = (id: string) => CONTACT_LINKS.find((l) => l.id === id)?.url || "#";

const socialIcons: Record<string, React.ElementType> = {
    github: Github,
    linkedin: Linkedin,
    email: Mail,
};

const quickLinks = [
    { label: "Projects", href: "/#projects" },
    { label: "Skills", href: "/#skills" },
    { label: "Activity", href: "/#activity" },
];

export function Footer() {
    const year = new Date().getFullYear();
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <>
            <footer className="border-t border-[var(--border)]/50 bg-[var(--bg)]/60 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-6">
                        {/* Brand */}
                        <div>
                            <Link href="/" className="text-lg font-bold mb-2 block hover:text-[var(--accent-cyan)] transition-colors">
                                {PERSONAL.handle}
                            </Link>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                {PERSONAL.bio}
                            </p>
                        </div>

                        {/* Explore */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                                Explore
                            </h4>
                            <ul className="space-y-1.5">
                                {modes.map((mode) => (
                                    <li key={mode.id}>
                                        <Link
                                            href={mode.href}
                                            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:translate-x-1 transition-all"
                                        >
                                            <mode.icon className="w-3.5 h-3.5" />
                                            {mode.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                                Quick Links
                            </h4>
                            <ul className="space-y-1.5">
                                {quickLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:translate-x-1 transition-all inline-block"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Connect */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                                Connect
                            </h4>
                            <div className="flex gap-2 mb-3">
                                {["github", "linkedin", "email"].map((id) => {
                                    const Icon = socialIcons[id];
                                    const url = getContactUrl(id);
                                    return (
                                        <a
                                            key={id}
                                            href={url}
                                            target={id !== "email" ? "_blank" : undefined}
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] hover:scale-110 transition-all"
                                        >
                                            <Icon className="w-4 h-4" />
                                        </a>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setContactOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--btn-bg)] text-[var(--btn-text)] hover:bg-[var(--btn-hover)] hover:scale-105 transition-all text-xs font-medium"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Send a Message
                            </button>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-4 border-t border-[var(--border)]/50 text-center text-xs text-[var(--text-muted)]">
                        <p>© {year} {PERSONAL.name}. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Contact Modal */}
            <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </>
    );
}
