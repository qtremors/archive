/**
 * NewspaperMasthead - Masthead header for newspaper mode
 * A-001: Extracted from NewspaperPage.tsx
 */

"use client";

import Link from "next/link";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { PERSONAL } from "@/config/site";

interface MastheadProps {
    theme: string;
    toggleTheme: () => void;
}

export function NewspaperMasthead({ theme, toggleTheme }: MastheadProps) {
    const today = new Date();
    const todayFormatted = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className="np-masthead">
            <div className="np-masthead-top">
                <Link href="/" className="np-back-link">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <span className="np-date">{todayFormatted}</span>
                <button onClick={toggleTheme} className="np-theme-toggle">
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>
            <h1 className="np-title">{PERSONAL.handle.toUpperCase()}</h1>
            <p className="np-subtitle">Your Daily Source for Tech Innovation & Development News</p>
        </header>
    );
}
