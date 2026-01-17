import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fira_Code, Playfair_Display, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdminProvider } from "@/components/AdminContext";
import { ToastProvider } from "@/components/ToastProvider";
import { NavButtonsProvider } from "@/components/NavButtonsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { SettingsProvider } from "@/components/SettingsContext";
import { ProviderComposer } from "@/components/ProviderComposer";

// Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-firacode",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tremors | Full-Stack Python Developer",
  description: "Portfolio of Tremors - Building AI-powered platforms, real-time systems, and advanced developer tooling.",
  keywords: ["portfolio", "developer", "python", "react", "next.js", "full-stack", "AI"],
  authors: [{ name: "Tremors", url: "https://github.com/qtremors" }],
  creator: "Tremors",
  openGraph: {
    title: "Tremors | Full-Stack Python Developer",
    description: "Building AI-powered platforms and developer tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${firaCode.variable} ${playfair.variable} ${sourceSerif.variable} antialiased overflow-x-hidden`}
      >
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--bg)] focus:text-[var(--text)] focus:border focus:border-[var(--border)] focus:rounded-lg"
        >
          Skip to content
        </a>
        <ProviderComposer
          providers={[
            ThemeProvider,
            AdminProvider,
            ToastProvider,
            SettingsProvider,
            NavButtonsProvider,
            ErrorBoundary,
          ]}
        >
          <KeyboardShortcuts />
          <main id="main-content">{children}</main>
        </ProviderComposer>
      </body>
    </html>
  );
}
