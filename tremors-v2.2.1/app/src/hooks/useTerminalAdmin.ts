/**
 * useTerminalAdmin - Hook for terminal admin authentication
 * A-002: Extracted from TerminalPage for better modularity
 */

import { useState, useCallback } from "react";
import { useAdmin } from "@/components/AdminContext";

interface SessionInfo {
    expiresIn: number;
}

interface SecretCheckResult {
    isSecret: boolean;
    needsSetup?: boolean;
    isLoggedIn?: boolean;
    sessionInfo?: SessionInfo;
}

interface UseTerminalAdminReturn {
    // State
    awaitingPassword: boolean;
    showAdminSetup: boolean;
    showAdminManage: boolean;
    sessionInfo: SessionInfo | null;
    isAdmin: boolean;

    // Actions
    checkSecretCommand: (cmd: string) => Promise<SecretCheckResult>;
    handlePasswordInput: (password: string) => Promise<{ success: boolean; error?: string }>;
    handleSetupSuccess: () => void;
    handleLogout: () => void;
    setAwaitingPassword: (value: boolean) => void;
    setShowAdminSetup: (value: boolean) => void;
    setShowAdminManage: (value: boolean) => void;
    setIsAdmin: (value: boolean) => void;
    setSessionInfo: (value: SessionInfo | null) => void;
}

export function useTerminalAdmin(): UseTerminalAdminReturn {
    const { isAdmin, setIsAdmin } = useAdmin();

    const [awaitingPassword, setAwaitingPassword] = useState(false);
    const [showAdminSetup, setShowAdminSetup] = useState(false);
    const [showAdminManage, setShowAdminManage] = useState(false);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

    /**
     * Check if input is the secret admin command
     */
    const checkSecretCommand = useCallback(async (cmd: string): Promise<SecretCheckResult> => {
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: cmd }),
            });
            const data = await res.json();

            if (data.success && data.isSecret) {
                if (data.needsSetup) {
                    setShowAdminSetup(true);
                } else if (data.isLoggedIn) {
                    setSessionInfo(data.sessionInfo || null);
                    setShowAdminManage(true);
                } else {
                    setAwaitingPassword(true);
                }

                return {
                    isSecret: true,
                    needsSetup: data.needsSetup,
                    isLoggedIn: data.isLoggedIn,
                    sessionInfo: data.sessionInfo,
                };
            }
        } catch {
            // Silently fail for non-secret commands
        }
        return { isSecret: false };
    }, []);

    /**
     * Handle password input for admin login
     */
    const handlePasswordInput = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", password }),
            });
            const data = await res.json();

            if (data.success) {
                setIsAdmin(true);
                setAwaitingPassword(false);
                return { success: true };
            } else {
                setAwaitingPassword(false);
                return { success: false, error: data.error || "Authentication failed." };
            }
        } catch {
            setAwaitingPassword(false);
            return { success: false, error: "Server error." };
        }
    }, [setIsAdmin]);

    /**
     * Handle successful admin account setup
     */
    const handleSetupSuccess = useCallback(() => {
        setShowAdminSetup(false);
        setIsAdmin(true);
    }, [setIsAdmin]);

    /**
     * Handle admin logout
     */
    const handleLogout = useCallback(() => {
        setShowAdminManage(false);
        setIsAdmin(false);
        // Also call logout API
        fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
    }, [setIsAdmin]);

    return {
        awaitingPassword,
        showAdminSetup,
        showAdminManage,
        sessionInfo,
        isAdmin,
        checkSecretCommand,
        handlePasswordInput,
        handleSetupSuccess,
        handleLogout,
        setAwaitingPassword,
        setShowAdminSetup,
        setShowAdminManage,
        setIsAdmin,
        setSessionInfo,
    };
}
