import { getGitHubData } from "@/lib/data";
import { TerminalPage } from "./TerminalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terminal | Tremors",
    description: "Interactive CLI-style portfolio. Type commands to explore projects, skills, and more.",
};

export default async function Page() {
    const data = await getGitHubData();

    return (
        <main className="min-h-screen">
            <TerminalPage data={data} />
        </main>
    );
}
