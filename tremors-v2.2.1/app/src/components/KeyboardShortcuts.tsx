/**
 * Global Keyboard Shortcuts
 * Provides navigation shortcuts across the app
 * Ctrl+` = Toggle Terminal
 */

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const SHORTCUTS: Record<string, { key: string; ctrl?: boolean; alt?: boolean; path: string }> = {
    terminal: { key: "`", ctrl: true, path: "/terminal" },
    resume: { key: "p", ctrl: true, alt: true, path: "/resume" },
    news: { key: "n", ctrl: true, alt: true, path: "/news" },
    nexus: { key: "x", ctrl: true, alt: true, path: "/nexus" },
};

export function KeyboardShortcuts() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check each shortcut
            for (const [, shortcut] of Object.entries(SHORTCUTS)) {
                const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
                const altMatch = shortcut.alt ? e.altKey : !e.altKey;

                if (e.key === shortcut.key && ctrlMatch && altMatch) {
                    e.preventDefault();

                    // If already on the page, go back to home
                    if (pathname === shortcut.path) {
                        router.push("/");
                    } else {
                        router.push(shortcut.path);
                    }
                    return;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router, pathname]);

    return null;
}
