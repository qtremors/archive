/**
 * Clean up script - removes all editions except fallbacks
 * Run with: npx tsx prisma/clean-editions.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Cleaning newspaper editions...\n");

    // Delete ALL editions (non-fallback and fallback)
    const deleted = await prisma.newspaperEdition.deleteMany({});
    console.log(`✓ Deleted ${deleted.count} editions`);

    console.log("\n✅ Database cleaned!");
    console.log("   Now run: npx tsx prisma/seed-newspaper.ts");
    console.log("   This will add only the 2 original fallbacks.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
