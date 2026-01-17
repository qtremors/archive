/**
 * NewspaperHeader - Conditional header for Newspaper mode
 * Shows full navbar for admin on desktop, mobile navbar for all users
 */

"use client";

import { useAdmin } from "@/components/AdminContext";
import { Header } from "@/components/Header";

export function NewspaperHeader() {
    const { isAdmin } = useAdmin();

    // Always show for mobile navigation, or show full for admin
    // CSS will handle showing/hiding based on breakpoint
    return <Header currentMode="news" />;
}
