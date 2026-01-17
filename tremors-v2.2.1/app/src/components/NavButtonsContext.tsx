/**
 * NavButtonsContext - Shares nav buttons visibility state between HeroSection and Header
 * When hero buttons scroll out of view, they appear in the Header navbar
 */

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NavButtonsContextType {
    showInHeader: boolean;
    setShowInHeader: (show: boolean) => void;
}

const NavButtonsContext = createContext<NavButtonsContextType | undefined>(undefined);

export function NavButtonsProvider({ children }: { children: ReactNode }) {
    const [showInHeader, setShowInHeader] = useState(false);

    return (
        <NavButtonsContext.Provider value={{ showInHeader, setShowInHeader }}>
            {children}
        </NavButtonsContext.Provider>
    );
}

export function useNavButtons() {
    const context = useContext(NavButtonsContext);
    if (!context) {
        throw new Error("useNavButtons must be used within NavButtonsProvider");
    }
    return context;
}
