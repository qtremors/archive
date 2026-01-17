/**
 * ASCII Logo Component
 * Displays the TREMORS ASCII art with effects
 */

import { forwardRef } from "react";
import type { ThemeColors } from "../lib/types";

interface Props {
    theme: ThemeColors;
    shaking: boolean;
}

const ASCII_LOGO = `████████╗██████╗ ███████╗███╗   ███╗ ██████╗ ██████╗ ███████╗
╚══██╔══╝██╔══██╗██╔════╝████╗ ████║██╔═══██╗██╔══██╗██╔════╝
   ██║   ██████╔╝█████╗  ██╔████╔██║██║   ██║██████╔╝███████╗
   ██║   ██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║██╔══██╗╚════██║
   ██║   ██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝██║  ██║███████║
   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝`;

export const AsciiLogo = forwardRef<HTMLPreElement, Props>(
    function AsciiLogo({ theme, shaking }, ref) {
        return (
            <pre
                ref={ref}
                className={`text-[0.35rem] md:text-[0.6rem] leading-tight mb-4 select-none ${shaking ? 'animate-shake' : 'animate-float'}`}
                style={{ color: theme.primary }}
                data-text={ASCII_LOGO.split('\n')[0]}
            >
                {ASCII_LOGO}
            </pre>
        );
    }
);
