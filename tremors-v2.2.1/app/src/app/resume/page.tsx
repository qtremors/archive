import { getGitHubData } from "@/lib/data";
import { PaperPage } from "./PaperPage";
import { Header } from "@/components/Header";
import { ModeErrorBoundary } from "@/components/ModeErrorBoundary";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resume | Tremors",
    description: "Document-style portfolio with sidebar navigation. A clean, minimal reading experience.",
};

export default async function Page() {
    const data = await getGitHubData();

    return (
        <ModeErrorBoundary mode="paper">
            <main className="min-h-screen">
                <Header currentMode="resume" />
                <PaperPage data={data} />
            </main>
        </ModeErrorBoundary>
    );
}
