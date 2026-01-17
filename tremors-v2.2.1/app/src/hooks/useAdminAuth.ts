/**
 * useAdminAuth - Custom hook for admin authentication state
 * Encapsulates auth check caching logic from AdminContext
 * B-001: Missing abstraction for admin state
 */

"use client";

import { useAdmin } from "@/components/AdminContext";
import { useToast } from "@/components/ToastProvider";
import { useCallback } from "react";

interface UseAdminAuthReturn {
    isAdmin: boolean;
    editMode: boolean;
    setEditMode: (value: boolean) => void;
    logout: () => Promise<void>;
    refreshStatus: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
    const { isAdmin, setIsAdmin, editMode, setEditMode, refreshAdminStatus } = useAdmin();
    const toast = useToast();

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setIsAdmin(false);
            setEditMode(false);
            toast.success("Logged out successfully");
        } catch {
            toast.error("Failed to logout");
        }
    }, [setIsAdmin, setEditMode, toast]);

    const refreshStatus = useCallback(() => {
        refreshAdminStatus();
    }, [refreshAdminStatus]);

    return {
        isAdmin,
        editMode,
        setEditMode,
        logout,
        refreshStatus,
    };
}
