/**
 * ProviderComposer - Flattens nested provider tree
 * Usage: <ProviderComposer providers={[ThemeProvider, AdminProvider]}>{children}</ProviderComposer>
 */

"use client";

import React from "react";

type ProviderComponent = React.ComponentType<{ children: React.ReactNode }>;

interface ProviderComposerProps {
    providers: ProviderComponent[];
    children: React.ReactNode;
}

export function ProviderComposer({ providers, children }: ProviderComposerProps) {
    return providers.reduceRight<React.ReactNode>(
        (acc, Provider) => <Provider>{acc}</Provider>,
        children
    );
}

