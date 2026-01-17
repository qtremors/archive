/**
 * Admin Context - Manages admin authentication and edit mode state
 * Admin login happens in Terminal, state verified via server-side cookie
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";

interface AdminContextType {
    isAdmin: boolean;
    setIsAdmin: (value: boolean) => void;
    editMode: boolean;
    setEditMode: (value: boolean) => void;
    refreshAdminStatus: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Cache admin check in sessionStorage to avoid redundant API calls
const ADMIN_CACHE_KEY = "admin_status_checked";

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const hasChecked = useRef(false);

    const checkAdminStatus = () => {
        fetch("/api/auth/check")
            .then(res => res.json())
            .then(data => {
                setIsAdmin(!!data.isAdmin);
                if (data.isAdmin) {
                    // Mark as checked in session
                    sessionStorage.setItem(ADMIN_CACHE_KEY, "true");
                } else {
                    // Clear cache on logout/session expiry
                    sessionStorage.removeItem(ADMIN_CACHE_KEY);
                }
            })
            .catch(() => {
                setIsAdmin(false);
                sessionStorage.removeItem(ADMIN_CACHE_KEY);
            });
    };

    // Verify admin session on initial mount only
    useEffect(() => {
        // Skip if already checked this render cycle
        if (hasChecked.current) return;
        hasChecked.current = true;

        // Check if we've already verified in this session
        const alreadyChecked = sessionStorage.getItem(ADMIN_CACHE_KEY);
        if (alreadyChecked) {
            // Still need to verify cookie is valid, but can be less urgent
            checkAdminStatus();
            return;
        }

        checkAdminStatus();
    }, []);

    // Recheck on window focus (in case session expired while tab was hidden)
    useEffect(() => {
        const handleFocus = () => {
            if (document.visibilityState === "visible") {
                checkAdminStatus();
            }
        };

        document.addEventListener("visibilitychange", handleFocus);
        return () => document.removeEventListener("visibilitychange", handleFocus);
    }, []);

    return (
        <AdminContext.Provider value={{ isAdmin, setIsAdmin, editMode, setEditMode, refreshAdminStatus: checkAdminStatus }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within AdminProvider");
    }
    return context;
}

