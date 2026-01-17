import type { Metadata } from "next";
import Hero from "./components/Hero";
import { ModeErrorBoundary } from "@/components/ModeErrorBoundary";

export const metadata: Metadata = {
    title: "Nexus | Tremors",
    description: "Welcome to the Tremors Nexus - navigate to different parts of the portfolio",
};

export default function NexusPage() {
    return (
        <main>
            <ModeErrorBoundary mode="nexus">
                <Hero />
            </ModeErrorBoundary>
        </main>
    );
}
