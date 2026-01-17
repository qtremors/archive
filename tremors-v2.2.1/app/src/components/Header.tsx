/**
 * Header - Simple navbar with logo, admin controls, and theme toggle
 * Nav buttons slide in from hero when scrolled
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/ToastProvider";
import { useNavButtons } from "@/components/NavButtonsContext";
import { PERSONAL } from "@/config/site";
import { Terminal, Moon, Sun, Pencil, RefreshCw, Check, FolderOpen, Newspaper, FileText, Menu, X, Home } from "lucide-react";

interface HeaderProps {
    currentMode: "default" | "resume" | "news" | "terminal" | "nexus";
}

export function Header({ currentMode }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const { isAdmin, editMode, setEditMode } = useAdmin();
    const { showInHeader } = useNavButtons();
    const toast = useToast();
    const [refreshing, setRefreshing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Refresh data from GitHub
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await fetch("/api/admin/refresh", { method: "POST" });
            if (res.ok) {
                toast.success("Data refreshed from GitHub");
                window.location.reload();
            } else {
                toast.error("Failed to refresh");
            }
        } catch {
            toast.error("Failed to refresh");
        } finally {
            setRefreshing(false);
        }
    };

    // Hide header on terminal mode (it has its own UI)
    if (currentMode === "terminal") return null;

    // Motion Link for animated buttons
    const MotionLink = motion.create(Link);

    return (
        <>
            {/* Desktop: Simple navbar - fully transparent */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 px-6 py-4 items-center justify-between bg-transparent">

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity"
                >
                    <span className={`relative w-6 h-6 ${isAdmin ? "admin-logo-glow" : ""}`}>
                        <img src="/alien.svg" alt="Logo" className="w-full h-full relative z-10" />
                    </span>
                </Link>

                {/* Center: Nav buttons that slide in from hero */}
                <AnimatePresence>
                    {showInHeader && currentMode === "default" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2 rounded-full"
                            style={{
                                background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--bg) 50%, transparent) 0%, transparent 80%)',
                                backdropFilter: 'blur(6px)',
                                WebkitBackdropFilter: 'blur(6px)',
                            }}
                        >
                            <motion.a
                                href="#projects"
                                layoutId="btn-projects"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <FolderOpen className="w-4 h-4" />
                                Projects
                            </motion.a>
                            <MotionLink
                                href="/news"
                                layoutId="btn-news"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <Newspaper className="w-4 h-4" />
                                News
                            </MotionLink>
                            <MotionLink
                                href="/resume"
                                layoutId="btn-resume"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <FileText className="w-4 h-4" />
                                Resume
                            </MotionLink>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right: Admin controls + Theme toggle */}
                <div className="flex items-center gap-2">
                    {/* Admin Controls - Only visible when logged in */}
                    {isAdmin && (
                        <>
                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className={`p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/50 transition-all ${refreshing ? "animate-spin" : ""
                                    }`}
                                title="Refresh from GitHub"
                                aria-label="Refresh data from GitHub"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            {/* Edit Toggle */}
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className={`p-2 rounded-lg transition-all ${editMode
                                    ? "text-green-400 bg-green-500/10"
                                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/50"
                                    }`}
                                title={editMode ? "Save and exit edit mode" : "Edit projects"}
                                aria-label={editMode ? "Exit edit mode" : "Enter edit mode"}
                            >
                                {editMode ? <Check className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                            </button>
                        </>
                    )}

                    {/* Nexus Portal Link */}
                    <a
                        href="https://qtremors.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nexus-portal-link p-2 rounded-lg transition-all"
                        title="Main Portfolio"
                        aria-label="Go to Main Portfolio"
                    >
                        <img
                            src="/blackhole-icon.png"
                            alt="Portal"
                            className="w-6 h-6 nexus-portal-icon"
                        />
                    </a>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/50 transition-all"
                        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Mobile: Simple top bar - respect page theme */}
            <div
                className={`md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between transition-colors ${isMenuOpen ? "bg-transparent" : "bg-transparent"}`}
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ color: isMenuOpen ? 'var(--text)' : (currentMode === 'news' ? 'var(--np-ink)' : currentMode === 'resume' ? 'var(--paper-text)' : 'var(--text)') }}
                >
                    <img src="/alien.svg" alt="Tremors logo" className="w-5 h-5" />
                    <span>{PERSONAL.handle.toLowerCase()}</span>
                </Link>

                <div className="flex items-center gap-1">
                    {isAdmin && (
                        <>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className={`p-2 rounded-lg ${currentMode === 'news' ? 'text-[var(--np-ink-light)]' : currentMode === 'resume' ? 'text-[var(--paper-muted)]' : 'text-[var(--text-muted)]'} ${refreshing ? "animate-spin" : ""}`}
                                title="Refresh data"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className={`p-2 rounded-lg ${editMode ? "text-green-400 bg-green-500/10" : currentMode === 'news' ? 'text-[var(--np-ink-light)]' : currentMode === 'resume' ? 'text-[var(--paper-muted)]' : 'text-[var(--text-muted)]'}`}
                                title={editMode ? "Exit edit mode" : "Enter edit mode"}
                            >
                                {editMode ? <Check className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                            </button>
                        </>
                    )}
                    <a
                        href="https://qtremors.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nexus-portal-link p-2 rounded-lg"
                        title="Main Portfolio"
                    >
                        <img src="/blackhole-icon.png" alt="Portal" className="w-6 h-6 nexus-portal-icon" />
                    </a>
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg ${currentMode === 'news' ? 'text-[var(--np-ink-light)]' : currentMode === 'resume' ? 'text-[var(--paper-muted)]' : 'text-[var(--text-muted)]'}`}
                        title="Toggle theme"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-2 rounded-lg ${isMenuOpen ? 'text-[var(--text)]' : (currentMode === 'news' ? 'text-[var(--np-ink)]' : currentMode === 'resume' ? 'text-[var(--paper-text)]' : 'text-[var(--text-muted)]')}`}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 z-40 pt-24 px-8"
                        style={{
                            backgroundColor: currentMode === 'news' ? 'var(--np-paper)' : currentMode === 'resume' ? 'var(--paper-bg)' : 'var(--bg)',
                            backgroundImage: currentMode === 'resume' ? 'var(--paper-texture)' : 'none',
                        }}
                    >
                        {/* Background Ornament - theme colored glow */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-20"
                            style={{
                                backgroundColor: currentMode === 'news' ? 'var(--np-accent)' : currentMode === 'resume' ? 'var(--paper-accent)' : 'var(--accent-cyan)'
                            }}
                        />

                        <motion.nav
                            className="flex flex-col gap-8 relative z-10"
                            variants={{
                                show: { transition: { staggerChildren: 0.1 } }
                            }}
                            initial="hidden"
                            animate="show"
                        >
                            {[
                                { href: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
                                { href: "/#projects", icon: <FolderOpen className="w-5 h-5" />, label: "Projects" },
                                { href: "/news", icon: <Newspaper className="w-5 h-5" />, label: "News" },
                                { href: "/resume", icon: <FileText className="w-5 h-5" />, label: "Resume" },
                                { href: "/terminal", icon: <Terminal className="w-5 h-5" />, label: "Terminal" }
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        show: { opacity: 1, x: 0 }
                                    }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-6 text-3xl font-bold transition-colors group"
                                        style={{
                                            color: currentMode === 'news' ? 'var(--np-ink)' : currentMode === 'resume' ? 'var(--paper-text)' : 'var(--text)'
                                        }}
                                    >
                                        <span
                                            className="p-3 rounded-2xl border transition-colors"
                                            style={{
                                                backgroundColor: currentMode === 'news' ? 'rgba(0,0,0,0.03)' : currentMode === 'resume' ? 'var(--paper-highlight)' : 'var(--bg-secondary)',
                                                borderColor: currentMode === 'news' ? 'var(--np-rule)' : currentMode === 'resume' ? 'var(--paper-border)' : 'var(--border)'
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.nav>

                        {isAdmin && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-16 pt-8 border-t relative z-10"
                                style={{ borderColor: currentMode === 'news' ? 'var(--np-rule)' : currentMode === 'resume' ? 'var(--paper-border)' : 'var(--border)' }}
                            >
                                <p
                                    className="text-xs uppercase tracking-widest mb-6 font-bold"
                                    style={{ color: currentMode === 'news' ? 'var(--np-ink-light)' : currentMode === 'resume' ? 'var(--paper-muted)' : 'var(--text-muted)' }}
                                >
                                    Admin Controls
                                </p>
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            handleRefresh();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center justify-between w-full p-4 rounded-2xl border active:scale-[0.98] transition-all"
                                        style={{
                                            backgroundColor: currentMode === 'news' ? 'rgba(0,0,0,0.02)' : currentMode === 'resume' ? 'var(--paper-highlight)' : 'var(--bg-secondary)',
                                            borderColor: currentMode === 'news' ? 'var(--np-rule)' : currentMode === 'resume' ? 'var(--paper-border)' : 'var(--border)',
                                            color: currentMode === 'news' ? 'var(--np-ink)' : currentMode === 'resume' ? 'var(--paper-text)' : 'var(--text)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <RefreshCw
                                                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                                                style={{ color: currentMode === 'news' ? 'var(--np-accent)' : currentMode === 'resume' ? 'var(--paper-accent)' : 'var(--accent-cyan)' }}
                                            />
                                            <span className="font-medium">Refresh GitHub Data</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode(!editMode);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all active:scale-[0.98] ${editMode ? "bg-green-500/10 border-green-500 text-green-400" : ""}`}
                                        style={!editMode ? {
                                            backgroundColor: currentMode === 'news' ? 'rgba(0,0,0,0.02)' : currentMode === 'resume' ? 'var(--paper-highlight)' : 'var(--bg-secondary)',
                                            borderColor: currentMode === 'news' ? 'var(--np-rule)' : currentMode === 'resume' ? 'var(--paper-border)' : 'var(--border)',
                                            color: currentMode === 'news' ? 'var(--np-ink)' : currentMode === 'resume' ? 'var(--paper-text)' : 'var(--text)'
                                        } : undefined}
                                    >
                                        <div className="flex items-center gap-4">
                                            {editMode ? <Check className="w-5 h-5" /> : (
                                                <Pencil
                                                    className="w-5 h-5"
                                                    style={{ color: currentMode === 'news' ? 'var(--np-accent)' : currentMode === 'resume' ? 'var(--paper-accent)' : 'var(--accent-cyan)' }}
                                                />
                                            )}
                                            <span className="font-medium">{editMode ? "Exit Edit Mode" : "Enter Edit Mode"}</span>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
