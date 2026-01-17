/**
 * Delete empty generations from today
 * Run with: npx tsx prisma/delete-empty-today.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Delete today's editions that used fallback content (not actual AI generations)
    const deleted = await prisma.newspaperEdition.deleteMany({
        where: {
            date: { gte: today, lte: todayEnd },
            isFallback: false,
            generatedBy: "fallback-content",
        },
    });

    console.log(`✓ Deleted ${deleted.count} empty generation(s) from today`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
