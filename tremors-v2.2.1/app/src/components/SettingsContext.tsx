/**
 * Settings Context - Manages site-wide settings like project view mode and image visibility
 * Persists changes to database and provides global access to settings
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ToastProvider";

interface Settings {
    showProjectImages: boolean;
    projectViewMode: "grid" | "list";
}

interface SettingsContextType {
    settings: Settings;
    updateSetting: (key: keyof Settings, value: boolean | string) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>({
        showProjectImages: true,
        projectViewMode: "grid",
    });
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // Fetch settings on mount
    useEffect(() => {
        fetch("/api/admin/settings")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.settings) {
                    setSettings({
                        showProjectImages: data.settings.showProjectImages ?? true,
                        projectViewMode: data.settings.projectViewMode === "list" ? "list" : "grid",
                    });
                }
            })
            .catch(() => {
                // Silently fail - use defaults
            })
            .finally(() => setLoading(false));
    }, []);

    const updateSetting = async (key: keyof Settings, value: boolean | string) => {
        try {
            // Optimistic update
            const prevSettings = { ...settings };
            setSettings(prev => ({ ...prev, [key]: value }));

            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value }),
            });

            if (!res.ok) throw new Error("Failed to save setting");

            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed to save setting");

        } catch (error) {
            console.error("Update setting error:", error);
            toast.error("Failed to save setting");
            // Rollback on error might be needed if we want strict consistency
            // but for UI settings, optimistic is usually fine
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within SettingsProvider");
    }
    return context;
}
