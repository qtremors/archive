/**
 * TerminalWelcome - Initial welcome screen for Terminal
 */

"use client";

import { PERSONAL } from "@/config/site";
import { AsciiLogo } from "./AsciiLogo";
import { CommandItem } from "./CommandItem";
import type { ThemeColors } from "../lib/types";

interface TerminalWelcomeProps {
    theme: ThemeColors;
    shaking: boolean;
    asciiRef: React.RefObject<HTMLPreElement | null>;
}

export function TerminalWelcome({ theme, shaking, asciiRef }: TerminalWelcomeProps) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 pt-8 pb-4">
            <AsciiLogo ref={asciiRef} theme={theme} shaking={shaking} />
            <p className="text-xs mb-6" style={{ color: theme.muted }}>{PERSONAL.tagline} • v2.0</p>

            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm max-w-sm text-left mb-6">
                <CommandItem cmd="/whoami" desc="profile" colors={theme} />
                <CommandItem cmd="/projects" desc="repos" colors={theme} />
                <CommandItem cmd="/neofetch" desc="sysinfo" colors={theme} />
                <CommandItem cmd="/theme" desc="colors" colors={theme} />
                <CommandItem cmd="/commands" desc="all" colors={theme} />
                <CommandItem cmd="exit" desc="go back" colors={theme} />
            </div>
            <p className="text-xs" style={{ color: theme.muted }}>Type /commands to see all available commands</p>
        </div>
    );
}
