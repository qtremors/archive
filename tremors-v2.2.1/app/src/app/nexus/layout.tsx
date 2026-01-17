"use client";

import StarsBackground from "./components/StarsBackground";
import Voyager from "./components/Voyager";
import BodyClassManager from "./components/BodyClassManager";
import "./nexus.css";

export default function NexusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="nexus-container">
            <BodyClassManager />
            <StarsBackground />
            <Voyager />
            {children}
        </div>
    );
}
