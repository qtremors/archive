/**
 * Loading Skeletons
 * Content-matching loading states for each page mode
 */

"use client";

// Base skeleton pulse component
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-[var(--border)] rounded ${className}`}
        />
    );
}

// Default Mode skeleton - Hero + Projects Grid
export function DefaultLoadingSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            {/* Hero skeleton */}
            <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24 min-h-[70vh]">
                <div className="order-2 lg:order-1">
                    <Skeleton className="w-32 h-6 mb-4" /> {/* Available badge */}
                    <Skeleton className="w-80 h-14 mb-4" /> {/* Name */}
                    <Skeleton className="w-56 h-8 mb-6" /> {/* Title */}
                    <Skeleton className="w-full max-w-lg h-20 mb-8" /> {/* Bio */}
                    <div className="flex gap-3"> {/* Navigation buttons */}
                        <Skeleton className="w-28 h-11 rounded-full" />
                        <Skeleton className="w-24 h-11 rounded-full" />
                        <Skeleton className="w-28 h-11 rounded-full" />
                    </div>
                </div>
                <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                    <Skeleton className="w-80 h-56 rounded-2xl" /> {/* Code block */}
                </div>
            </section>

            {/* Projects Section skeleton */}
            <section className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                    <Skeleton className="w-32 h-8" />
                    <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                {/* Featured Projects - 5 column layout with center placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="md:col-span-2 aspect-[2/1]">
                        <Skeleton className="w-full h-full rounded-xl" />
                    </div>
                    <div className="hidden md:flex md:col-span-1 aspect-square items-center justify-center">
                        <Skeleton className="w-16 h-16 rounded-full" />
                    </div>
                    <div className="md:col-span-2 aspect-[2/1]">
                        <Skeleton className="w-full h-full rounded-xl" />
                    </div>
                </div>
                {/* Second row - 3 medium cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[2/1]">
                            <Skeleton className="w-full h-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills Section skeleton */}
            <section className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                    <Skeleton className="w-24 h-8" />
                    <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </section>
        </div>
    );
}

// Paper Mode skeleton - Sidebar + Content
// Uses paper-mode CSS variables for proper theming
export function PaperLoadingSkeleton() {
    return (
        <>
            {/* Import paper styles for theming */}
            <style>{`
                .paper-skeleton {
                    --paper-bg: #f5f3ef;
                    --paper-border: #d4d0c8;
                }
                [data-theme="dark"] .paper-skeleton {
                    --paper-bg: #1a1a1a;
                    --paper-border: #3a3a3a;
                }
            `}</style>
            <div className="paper-skeleton min-h-screen" style={{ backgroundColor: 'var(--paper-bg)' }}>
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-[240px_1fr] gap-12">
                        {/* Sidebar skeleton */}
                        <aside className="hidden md:block">
                            <div className="sticky top-24 space-y-4">
                                <div className="animate-pulse rounded h-10 w-full" style={{ backgroundColor: 'var(--paper-border)' }} />
                                <div className="space-y-2 pt-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="animate-pulse rounded h-8 w-full" style={{ backgroundColor: 'var(--paper-border)' }} />
                                    ))}
                                </div>
                            </div>
                        </aside>
                        {/* Main content skeleton */}
                        <main className="space-y-12">
                            {/* Hero */}
                            <section>
                                <div className="animate-pulse rounded h-10 w-64 mb-4" style={{ backgroundColor: 'var(--paper-border)' }} />
                                <div className="animate-pulse rounded h-6 w-48 mb-2" style={{ backgroundColor: 'var(--paper-border)' }} />
                                <div className="animate-pulse rounded h-20 w-full" style={{ backgroundColor: 'var(--paper-border)' }} />
                            </section>
                            {/* Content sections */}
                            {[1, 2, 3, 4].map((i) => (
                                <section key={i}>
                                    <div className="animate-pulse rounded h-8 w-32 mb-4" style={{ backgroundColor: 'var(--paper-border)' }} />
                                    <div className="animate-pulse rounded h-24 w-full" style={{ backgroundColor: 'var(--paper-border)' }} />
                                </section>
                            ))}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}

// Newspaper Mode skeleton - Editorial layout
// Uses newspaper theme colors for proper styling
export function NewspaperLoadingSkeleton() {
    return (
        <>
            {/* Inject newspaper theme styles */}
            <style>{`
                .newspaper-skeleton {
                    --np-bg: #0d0d0d;
                    --np-paper: #f5f0e8;
                    --np-border: #d4cfc4;
                    --np-accent: #c41e3a;
                }
            `}</style>
            <div className="newspaper-skeleton min-h-screen" style={{ backgroundColor: 'var(--np-bg)' }}>
                <div style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    background: 'var(--np-paper)',
                    minHeight: '100vh',
                    padding: '40px 60px'
                }}>
                    {/* Masthead skeleton */}
                    <header style={{ textAlign: 'center', borderBottom: '3px double var(--np-border)', paddingBottom: '24px', marginBottom: '32px' }}>
                        <div className="animate-pulse rounded mx-auto mb-2" style={{ width: '200px', height: '48px', backgroundColor: 'var(--np-border)' }} />
                        <div className="animate-pulse rounded mx-auto" style={{ width: '160px', height: '16px', backgroundColor: 'var(--np-border)' }} />
                    </header>

                    {/* Headline skeleton */}
                    <section style={{ marginBottom: '32px' }}>
                        <div className="animate-pulse rounded mx-auto mb-4" style={{ width: '75%', height: '48px', backgroundColor: 'var(--np-border)' }} />
                        <div className="animate-pulse rounded mx-auto" style={{ width: '50%', height: '24px', backgroundColor: 'var(--np-border)' }} />
                    </section>

                    {/* Two-column content skeleton */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="animate-pulse rounded" style={{ height: '120px', backgroundColor: 'var(--np-border)' }} />
                            <div className="animate-pulse rounded" style={{ height: '100px', backgroundColor: 'var(--np-border)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="animate-pulse rounded" style={{ height: '100px', backgroundColor: 'var(--np-border)' }} />
                            <div className="animate-pulse rounded" style={{ height: '120px', backgroundColor: 'var(--np-border)' }} />
                        </div>
                    </div>

                    {/* Projects table skeleton */}
                    <div style={{ marginBottom: '32px' }}>
                        <div className="animate-pulse rounded mb-3" style={{ width: '150px', height: '24px', backgroundColor: 'var(--np-border)' }} />
                        <div className="animate-pulse rounded" style={{ height: '200px', backgroundColor: 'var(--np-border)' }} />
                    </div>

                    {/* Skills 5-column skeleton */}
                    <div style={{ marginBottom: '32px' }}>
                        <div className="animate-pulse rounded mb-3" style={{ width: '180px', height: '20px', backgroundColor: 'var(--np-border)' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0', border: '1px solid var(--np-border)' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ padding: '16px', borderRight: i < 5 ? '1px dotted var(--np-border)' : 'none', textAlign: 'center' }}>
                                    <div className="animate-pulse rounded mx-auto mb-3" style={{ width: '70%', height: '16px', backgroundColor: 'var(--np-accent)', opacity: 0.3 }} />
                                    <div className="animate-pulse rounded mx-auto mb-2" style={{ width: '80%', height: '12px', backgroundColor: 'var(--np-border)' }} />
                                    <div className="animate-pulse rounded mx-auto mb-2" style={{ width: '60%', height: '12px', backgroundColor: 'var(--np-border)' }} />
                                    <div className="animate-pulse rounded mx-auto" style={{ width: '70%', height: '12px', backgroundColor: 'var(--np-border)' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Terminal Mode skeleton
export function TerminalLoadingSkeleton() {
    return (
        <div className="h-screen bg-[var(--bg)] flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-4 animate-pulse">Loading terminal...</p>
        </div>
    );
}

// Generic loading - just dots (for fallback)
export function LoadingSkeleton() {
    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
        </div>
    );
}
