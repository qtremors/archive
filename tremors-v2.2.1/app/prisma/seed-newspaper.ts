/**
 * Seed script to create fallback newspaper content
 * Idempotent - only seeds if no fallbacks exist
 * Run with: npx tsx prisma/seed-newspaper.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FALLBACK_DATE = new Date("2000-10-23T00:00:00Z");

// Fallback 1: Original Editorial Style
const FALLBACK_EDITORIAL = {
    date: FALLBACK_DATE,
    headline: "LOCAL DEVELOPER BUILDS AI-POWERED PLATFORMS, REFUSES TO STOP PUSHING COMMITS",
    subheadline: "Tremors continues his relentless pursuit of cleaner code and smarter applications",
    bodyContent: JSON.stringify([
        "In a world increasingly dominated by AI assistants and automated workflows, one developer has made it his mission to bridge the gap between traditional web engineering and cutting-edge language models. Tremors, a Computer Science graduate and self-proclaimed \"Full-Stack Python Developer,\" has been quietly building an impressive portfolio of projects that span from quiz platforms to music players.",
        "\"I fell in love with Python,\" Tremors explains, \"and I never looked back. There's an elegance to it that just makes sense.\" His focus on the Django and FastAPI ecosystems has led to the creation of numerous production-ready applications, each demonstrating a deep understanding of backend architecture and real-time web features.",
        "Beyond application development, Tremors has demonstrated a penchant for developer tooling—creating CLIs for Git visualization, remote control APIs for system management, and even a custom Terminal UI for his portfolio. \"I appreciate the details of how software interacts with the underlying system,\" he notes.",
        "Currently, Tremors is exploring the intersection of traditional web engineering and LLM capabilities, with the goal of creating \"smarter applications\" that adapt to user needs in real-time. His status: actively seeking new opportunities.",
    ]),
    pullQuote: "\"I believe in writing code that's not just functional, but clean, efficient, and maintainable.\"",
    isActive: true,
    isFallback: true,
    generatedBy: null,
};

// Fallback 2: Dramatic Tabloid Style
const FALLBACK_TABLOID = {
    date: FALLBACK_DATE,
    headline: "TREMORS CONTINUES REIGN OF TERROR ACROSS GITHUB",
    subheadline: "Repositories tremble as commits pile up at alarming rate",
    bodyContent: JSON.stringify([
        "In what industry analysts are calling \"absolutely expected behavior,\" local developer Tremors has once again demonstrated an unwavering commitment to pushing code at hours that medical professionals describe as \"concerning.\"",
        "Sources close to the keyboard report that the developer has mastered technologies including Python, Django, and FastAPI, leaving competitors to wonder: \"Do they ever sleep?\"",
        "When reached for comment, Tremors simply muttered something about \"one more commit\" before returning to what witnesses describe as \"an unhealthy number of browser tabs.\"",
    ]),
    pullQuote: "\"I'll refactor it tomorrow.\" — Tremors, reportedly every single day",
    isActive: false,
    isFallback: true,
    generatedBy: null,
};

async function main() {
    // Check if fallbacks already exist (idempotent)
    const existingFallbacks = await prisma.newspaperEdition.count({
        where: { isFallback: true },
    });

    if (existingFallbacks > 0) {
        console.log(`✓ ${existingFallbacks} fallback editions already exist, skipping seed.`);
        return;
    }

    console.log("Seeding fallback newspaper editions...\n");

    // Create Editorial fallback (active)
    await prisma.newspaperEdition.create({
        data: FALLBACK_EDITORIAL,
    });
    console.log("✓ Created Editorial fallback (ACTIVE)");

    // Create Tabloid fallback
    await prisma.newspaperEdition.create({
        data: FALLBACK_TABLOID,
    });
    console.log("✓ Created Tabloid fallback");

    console.log("\n✅ Fallback editions seeded successfully!");
}

main()
    .catch((e) => {
        console.error("Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
