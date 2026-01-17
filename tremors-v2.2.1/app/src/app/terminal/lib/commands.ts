/**
 * Terminal Command Handlers
 * Each function handles a specific command and returns output lines
 */

import type { TerminalLine } from "./types";
import type { GitHubRepo, GitHubUser } from "@/types";
import { PERSONAL, CONTACT_LINKS, SKILLS } from "@/config/site";

export interface CommandContext {
    repos: GitHubRepo[];
    user: GitHubUser | null;
    hiddenRepos: Set<string>;
    isAdmin: boolean;
    termTheme: string;
    termFont: string;
    commandHistory: string[];
    commandBlocks: Array<{ command: string; lines: TerminalLine[] }>;
}

export type CommandResult = {
    lines: TerminalLine[];
    action?: "clear" | "exit" | "logout" | "openThemeSelector" | "openFontSelector" | "toggleCrt";
    repoToHide?: string;
    repoToShow?: string;
    newFont?: "mono" | "firacode" | "jetbrains";
};

const addLine = (lines: TerminalLine[], type: TerminalLine["type"], content: string) => {
    lines.push({ type, content });
};

export const commands: Record<string, (args: string[], ctx: CommandContext) => CommandResult> = {
    help: (args, ctx) => {
        const lines: TerminalLine[] = [];
        addLine(lines, "heading", "Navigation");
        addLine(lines, "output", "/whoami       Display profile info");
        addLine(lines, "output", "/projects     List all projects");
        addLine(lines, "output", "/skills       Show technical skills");
        addLine(lines, "output", "/contact      Contact information");
        addLine(lines, "output", "/stats        GitHub statistics");
        addLine(lines, "output", "/repo <name>  Open repo in browser");
        addLine(lines, "heading", "Terminal");
        addLine(lines, "output", "/theme        Change color theme");
        addLine(lines, "output", "/font         Change terminal font");
        addLine(lines, "output", "/crt          Toggle CRT effect");
        addLine(lines, "output", "/history      Show command history");
        addLine(lines, "output", "/shortcuts    Keyboard shortcuts");
        addLine(lines, "output", "/clear        Clear terminal");
        addLine(lines, "output", "/export       Copy session to clipboard");
        addLine(lines, "output", "exit          Return to main page");
        if (ctx.isAdmin) {
            addLine(lines, "heading", "Admin");
            addLine(lines, "output", "/list         Show all repos (hidden)");
            addLine(lines, "output", "/hide <repo>  Hide a repo");
            addLine(lines, "output", "/show <repo>  Show a hidden repo");
            addLine(lines, "output", "/logout       Exit admin session");
        }
        return { lines };
    },

    exit: () => ({ lines: [{ type: "system", content: "Exiting terminal..." }], action: "exit" }),
    quit: () => ({ lines: [{ type: "system", content: "Exiting terminal..." }], action: "exit" }),
    q: () => ({ lines: [{ type: "system", content: "Exiting terminal..." }], action: "exit" }),
    ":q": () => ({ lines: [{ type: "system", content: "Exiting terminal..." }], action: "exit" }),

    whoami: () => {
        const lines: TerminalLine[] = [];
        addLine(lines, "heading", PERSONAL.name);
        addLine(lines, "output", PERSONAL.tagline);
        addLine(lines, "output", `Location: ${PERSONAL.location}`);
        addLine(lines, "output", PERSONAL.bio);
        if (PERSONAL.availableForWork) {
            addLine(lines, "success", "[OK] Available for opportunities");
        }
        return { lines };
    },

    projects: (args, ctx) => {
        const lines: TerminalLine[] = [];
        const visibleRepos = ctx.repos.filter(r => !ctx.hiddenRepos.has(r.name));
        visibleRepos.slice(0, 10).forEach(repo => {
            addLine(lines, "output", `${repo.name.padEnd(22)} ${(repo.language || "-").padEnd(10)} *${repo.stargazers_count}`);
        });
        return { lines };
    },
    ls: (args, ctx) => commands.projects(args, ctx),

    skills: () => {
        const lines: TerminalLine[] = [];
        SKILLS.forEach(cat => {
            addLine(lines, "output", `${cat.label}: ${cat.skills.join(", ")}`);
        });
        return { lines };
    },

    contact: () => {
        const lines: TerminalLine[] = [];
        CONTACT_LINKS.forEach(link => {
            addLine(lines, "output", `${link.label}: ${link.url.replace("mailto:", "").replace("https://", "")}`);
        });
        return { lines };
    },

    stats: (args, ctx) => {
        const lines: TerminalLine[] = [];
        addLine(lines, "output", `Repositories: ${ctx.user?.public_repos || ctx.repos.length}`);
        addLine(lines, "output", `Total Stars:  ${ctx.repos.reduce((s, r) => s + r.stargazers_count, 0)}`);
        addLine(lines, "output", `Followers:    ${ctx.user?.followers || 0}`);
        addLine(lines, "output", `Following:    ${ctx.user?.following || 0}`);
        return { lines };
    },

    shortcuts: () => {
        const lines: TerminalLine[] = [];
        addLine(lines, "heading", "Global Keyboard Shortcuts");
        addLine(lines, "output", "  Ctrl + `         Open/close terminal");
        addLine(lines, "output", "  Ctrl + Alt + P   Go to Resume");
        addLine(lines, "output", "  Ctrl + Alt + N   Go to News");
        addLine(lines, "heading", "Terminal Shortcuts");
        addLine(lines, "output", "  ↑/↓              Navigate command history");
        addLine(lines, "output", "  Tab              Autocomplete command");
        addLine(lines, "output", "  Esc              Close selector/cancel");
        return { lines };
    },

    clear: () => ({ lines: [], action: "clear" }),

    list: (args, ctx) => {
        const lines: TerminalLine[] = [];
        if (ctx.isAdmin) {
            ctx.repos.forEach(repo => {
                const hidden = ctx.hiddenRepos.has(repo.name);
                addLine(lines, hidden ? "error" : "output", `${hidden ? "[-]" : "[+]"} ${repo.name}`);
            });
        } else {
            addLine(lines, "error", "Permission denied.");
        }
        return { lines };
    },

    hide: (args, ctx) => {
        const lines: TerminalLine[] = [];
        if (ctx.isAdmin && args[0]) {
            const repo = ctx.repos.find(r => r.name.toLowerCase() === args[0]);
            if (repo) {
                addLine(lines, "success", `Hidden: ${repo.name}`);
                return { lines, repoToHide: repo.name };
            } else {
                addLine(lines, "error", `Not found: ${args[0]}`);
            }
        } else if (ctx.isAdmin) {
            addLine(lines, "output", "Usage: /hide <repo>");
        } else {
            addLine(lines, "error", "Permission denied.");
        }
        return { lines };
    },

    show: (args, ctx) => {
        const lines: TerminalLine[] = [];
        if (ctx.isAdmin && args[0]) {
            addLine(lines, "success", `Visible: ${args[0]}`);
            return { lines, repoToShow: args[0] };
        } else if (ctx.isAdmin) {
            addLine(lines, "output", "Usage: /show <repo>");
        } else {
            addLine(lines, "error", "Permission denied.");
        }
        return { lines };
    },

    logout: (args, ctx) => {
        const lines: TerminalLine[] = [];
        if (ctx.isAdmin) {
            addLine(lines, "success", "Logging out...");
            return { lines, action: "logout" as const };
        } else {
            addLine(lines, "error", "Not logged in.");
        }
        return { lines };
    },

    commands: (args, ctx) => {
        const lines: TerminalLine[] = [];
        addLine(lines, "heading", "Portfolio Commands");
        addLine(lines, "output", "  /whoami      Your profile info");
        addLine(lines, "output", "  /projects    List repositories");
        addLine(lines, "output", "  /skills      Technical skills");
        addLine(lines, "output", "  /contact     Contact links");
        addLine(lines, "output", "  /stats       GitHub statistics");
        addLine(lines, "heading", "Terminal Commands");
        addLine(lines, "output", "  /theme       Change theme");
        addLine(lines, "output", "  /font        Change font");
        addLine(lines, "output", "  /clear       Clear terminal");
        addLine(lines, "heading", "Fun Commands");
        addLine(lines, "output", "  /neofetch    System info display");
        addLine(lines, "output", "  /fortune     Random fortune");
        addLine(lines, "output", "  /cowsay      Cow says something");
        addLine(lines, "heading", "Navigation");
        addLine(lines, "output", "  exit         Return to main page");
        if (ctx.isAdmin) {
            addLine(lines, "heading", "Extended Commands");
            addLine(lines, "output", "  /list          Show all repos");
            addLine(lines, "output", "  /hide <repo>   Hide a repo");
            addLine(lines, "output", "  /show <repo>   Show a repo");
            addLine(lines, "output", "  /logout        Exit session");
        }
        return { lines };
    },

    theme: () => ({ lines: [], action: "openThemeSelector" }),

    font: (args, ctx) => {
        const lines: TerminalLine[] = [];
        const fontNames: Record<string, string> = {
            mono: "System Mono",
            firacode: "Fira Code",
            jetbrains: "JetBrains Mono"
        };
        if (args[0] === "mono" || args[0] === "firacode" || args[0] === "jetbrains") {
            addLine(lines, "success", `Font changed to: ${fontNames[args[0]]}`);
            return { lines, newFont: args[0] };
        } else if (args[0]) {
            addLine(lines, "error", `Unknown font: ${args[0]}`);
            addLine(lines, "output", "Available: mono, firacode, jetbrains");
        } else {
            // Open font selector TUI (same UX as theme)
            return { lines: [], action: "openFontSelector" };
        }
        return { lines };
    },

    history: (args, ctx) => {
        const lines: TerminalLine[] = [];
        if (ctx.commandHistory.length === 0) {
            addLine(lines, "output", "No command history yet.");
        } else {
            ctx.commandHistory.slice(-10).forEach((cmd, i) => {
                addLine(lines, "output", `  ${i + 1}. ${cmd}`);
            });
        }
        return { lines };
    },

    echo: (args) => ({ lines: [{ type: "output", content: args.join(" ") || "" }] }),

    crt: () => {
        return { lines: [{ type: "success", content: "CRT effect toggled" }], action: "toggleCrt" };
    },

    export: (args, ctx) => {
        const session = ctx.commandBlocks.map(b => `> ${b.command}\n${b.lines.map(l => l.content).join("\n")}`).join("\n\n");
        navigator.clipboard.writeText(session).catch(() => { });
        return { lines: [{ type: "success", content: "Session copied to clipboard!" }] };
    },

    repo: (args, ctx) => {
        const lines: TerminalLine[] = [];
        if (args[0]) {
            const repoName = args[0].toLowerCase();
            const repo = ctx.repos.find(r => r.name.toLowerCase() === repoName);
            if (repo) {
                const win = window.open(repo.html_url, "_blank");
                if (win) {
                    addLine(lines, "success", `Opening ${repo.name}...`);
                } else {
                    // Popup blocked - show URL as fallback
                    addLine(lines, "output", `Popup blocked. Visit: ${repo.html_url}`);
                }
            } else {
                addLine(lines, "error", `Repository not found: ${args[0]}`);
            }
        } else {
            addLine(lines, "output", "Usage: /repo <name>");
        }
        return { lines };
    },
};

// Add aliases for commands with /prefix
Object.keys(commands).forEach(key => {
    if (!key.startsWith("/") && !key.startsWith(":")) {
        commands[`/${key}`] = commands[key];
    }
});
