/**
 * API Route: /api/newspaper/editions
 * Lists all newspaper editions for the archive dropdown
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const editions = await prisma.newspaperEdition.findMany({
            orderBy: { createdAt: "desc" }, // Order by actual creation time (newest first)
            select: {
                id: true,
                date: true,
                createdAt: true, // Return actual creation timestamp
                headline: true,
                isActive: true,
                isFallback: true,
                generatedBy: true,
            },
        });

        return NextResponse.json({ editions });
    } catch (error) {
        console.error("Failed to fetch editions:", error);
        return NextResponse.json({ editions: [] });
    }
}
