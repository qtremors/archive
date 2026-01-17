/**
 * API Route: /api/news/rss
 * Generates RSS 2.0 feed for newspaper editions
 */

import { prisma } from "@/lib/db";
import { PERSONAL, SITE_URL } from "@/config/site";

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * GET: Return RSS 2.0 feed of newspaper editions
 */
export async function GET() {
    try {
        // Fetch published editions (non-fallback, ordered by date desc)
        const editions = await prisma.newspaperEdition.findMany({
            where: { isFallback: false },
            orderBy: { date: "desc" },
            take: 20, // Limit to most recent 20 editions
            select: {
                id: true,
                date: true,
                headline: true,
                subheadline: true,
                bodyContent: true,
                createdAt: true,
            },
        });

        const feedTitle = "The Tremors Chronicle";
        const feedDescription = `AI-generated news about ${PERSONAL.name} - "${PERSONAL.tagline}"`;
        const feedUrl = `${SITE_URL}/news`;
        const rssUrl = `${SITE_URL}/api/news/rss`;
        const lastBuildDate = editions.length > 0
            ? new Date(editions[0].date).toUTCString()
            : new Date().toUTCString();

        // Build RSS items
        const items = editions.map((edition) => {
            const pubDate = new Date(edition.date).toUTCString();
            const link = `${feedUrl}?edition=${edition.id}`;

            // Parse body content
            let description = edition.subheadline;
            let fullContent = "";
            try {
                const bodyParts = JSON.parse(edition.bodyContent) as string[];
                if (bodyParts.length > 0) {
                    description = `${edition.subheadline} — ${bodyParts[0].substring(0, 200)}...`;
                    // Build full HTML content
                    fullContent = `<h2>${escapeXml(edition.subheadline)}</h2>\n` +
                        bodyParts.map(p => `<p>${escapeXml(p)}</p>`).join("\n");
                }
            } catch {
                // Keep subheadline as description
            }

            return `    <item>
      <title>${escapeXml(edition.headline)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${fullContent}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${edition.id}</guid>
    </item>`;
        }).join("\n");

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${escapeXml(feedUrl)}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(rssUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

        return new Response(rss, {
            headers: {
                "Content-Type": "application/rss+xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Failed to generate RSS feed:", error);
        return new Response("Failed to generate RSS feed", { status: 500 });
    }
}
