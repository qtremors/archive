/**
 * CommandItem Component
 * Menu item showing command and description
 */

import type { ThemeColors } from "../lib/types";

interface Props {
    cmd: string;
    desc: string;
    colors: ThemeColors;
}

export function CommandItem({ cmd, desc, colors }: Props) {
    return (
        <div className="flex items-center gap-2">
            <span style={{ color: colors.primary }}>{cmd}</span>
            <span style={{ color: colors.muted }}>{desc}</span>
        </div>
    );
}
