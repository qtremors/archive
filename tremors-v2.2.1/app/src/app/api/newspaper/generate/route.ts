/**
 * API Route: /api/newspaper/generate
 * Generates hilarious daily newspaper content using Gemini AI
 * Falls back to stored content if API unavailable
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PERSONAL, SKILLS, NEWS_AGENT } from "@/config/site";
import { verifyAdminCookie } from "@/lib/auth";
import {
    getISTDateString,
    getISTParts,
    getStartOfDayIST,
    getEndOfDayIST,
    formatIST
} from "@/lib/date";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-flash-lite-latest"; // Latest flash lite model

// Fallback content when AI is unavailable
const FALLBACK_CONTENT = {
    headline: `${PERSONAL.name.split(" ")[0].toUpperCase()} CONTINUES REIGN OF TERROR ACROSS GITHUB`,
    subheadline: "Repositories tremble as commits pile up at alarming rate",
    bodyContent: JSON.stringify([
        `In what industry analysts are calling "absolutely expected behavior," local developer ${PERSONAL.name} has once again demonstrated an unwavering commitment to pushing code at hours that medical professionals describe as "concerning."`,
        `Sources close to the keyboard report that the developer has mastered technologies including ${SKILLS[0]?.skills.slice(0, 3).join(", ") || "various programming languages"}, leaving competitors to wonder: "Do they ever sleep?"`,
        `When reached for comment, ${PERSONAL.name.split(" ")[0]} simply muttered something about "one more commit" before returning to what witnesses describe as "an unhealthy number of browser tabs."`
    ]),
    pullQuote: `"I'll refactor it tomorrow." — ${PERSONAL.name.split(" ")[0]}, reportedly every single day`,
    location: "VØID",
};

interface GeminiResponse {
    candidates?: Array<{
        content: {
            parts: Array<{ text: string }>;
        };
    }>;
}

/**
 * Build rich context for Skye about the developer's last 24 hours AND global history
 * Timezone: Asia/Kolkata (GMT+5:30)
 */
async function buildContext() {
    // Current time in IST
    const now = new Date();
    const timeZone = "Asia/Kolkata";

    // Helper to format date in IST
    const getISTDate = (date: Date) => formatIST(date, {
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hour12: false
    });

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch all repos (Global Context)
    const allRepos = await prisma.repo.findMany({
        where: { hidden: false },
        orderBy: { pushedAt: "desc" },
    });

    // Fetch all commits (Historical Context)
    const allCommits = await prisma.commit.findMany({
        orderBy: { date: "desc" },
        take: 50, // Enough for recent history + distinct streak check
    });

    // Fetch strictly today's/24h data (Daily Context)
    const [recentCommits24h, recentActivity24h] = await Promise.all([
        prisma.commit.findMany({
            where: { date: { gte: twentyFourHoursAgo } },
            orderBy: { date: "desc" },
        }),
        prisma.activity.findMany({
            where: { date: { gte: twentyFourHoursAgo } },
            orderBy: { date: "desc" },
        })
    ]);

    // === GLOBAL REPO STATS (History) ===
    const repoCount = allRepos.length;
    const totalStars = allRepos.reduce((sum, r) => sum + r.stars, 0);
    const featuredRepos = allRepos.filter(r => r.featured).map(r => r.name);

    // Top languages
    const langCounts: Record<string, number> = {};
    allRepos.forEach(r => {
        if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang, count]) => `${lang} (${count})`);

    // Least active repos (Dormant - no commits in 30+ days)
    const recentRepoNames = new Set(allCommits.map(c => c.repoName));
    const dormantRepos = allRepos
        .filter(r => !recentRepoNames.has(r.name))
        .slice(0, 3)
        .map(r => {
            const lastPush = new Date(r.pushedAt);
            const daysDormant = Math.floor((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24));
            return `${r.name} (${daysDormant} days dormant)`;
        });

    // Oldest active repo (Legacy check)
    const oldestActiveRepo = allRepos
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

    // === DAILY ACTIVITY (Last 24h) ===
    // Most active repo in last 24h
    const commitsByRepo24h: Record<string, number> = {};
    recentCommits24h.forEach(c => {
        commitsByRepo24h[c.repoName] = (commitsByRepo24h[c.repoName] || 0) + 1;
    });
    const mostActiveToday = Object.entries(commitsByRepo24h)
        .sort((a, b) => b[1] - a[1])[0];

    const commitSummary24h = recentCommits24h.length > 0
        ? recentCommits24h.slice(0, 15).map(c => `- ${c.repoName}: ${c.message} (${getISTDate(new Date(c.date))})`).join("\n")
        : "No commits pushed in the last 24 hours.";

    const eventSummary24h = recentActivity24h.length > 0
        ? recentActivity24h.slice(0, 15).map(a => `- ${a.repoName}: ${a.title} (${getISTDate(new Date(a.date))})`).join("\n")
        : "No major repository events tracked in the last 24 hours.";

    // Streak Check
    const commitDates = new Set(allCommits.map(c => getISTDateString(new Date(c.date))));
    let streak = 0;
    // We need to check streak based on "Today" in IST
    const todayIST = getISTDateString(now);
    let checkDateObj = new Date(now);

    // Simple loop check using IST date strings
    while (true) {
        const dateStr = getISTDateString(checkDateObj);
        if (commitDates.has(dateStr)) {
            streak++;
            checkDateObj.setDate(checkDateObj.getDate() - 1);
        } else {
            // If today has no commits yet, allowing streak to continue from yesterday
            if (streak === 0 && dateStr === todayIST) {
                checkDateObj.setDate(checkDateObj.getDate() - 1);
                continue;
            }
            break;
        }
    }

    // === CALENDAR ===
    const todayDateStr = formatIST(now, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const { month, day } = getISTParts(now);

    const holidays: string[] = [];
    if (month === 1 && day === 1) holidays.push("New Year's Day");
    if (month === 10 && day === 31) holidays.push("Halloween");
    if (month === 12 && day === 25) holidays.push("Christmas");
    if (month === 10 || month === 11) if (day >= 20 && day <= 31) holidays.push("Diwali/Festive Season");

    return {
        name: PERSONAL.name,
        todayDate: todayDateStr + " (IST)",
        holidays: holidays.length > 0 ? holidays.join(", ") : null,

        // Global Context (History)
        repoCount,
        totalStars,
        topLanguages: topLanguages.join(", "),
        featuredRepos: featuredRepos.join(", "),
        dormantRepos: dormantRepos.join(", "),
        oldestActiveRepo: oldestActiveRepo ? `${oldestActiveRepo.name} (since ${new Date(oldestActiveRepo.createdAt).getFullYear()})` : "None",

        // Daily Context (24h)
        activityInLast24h: {
            commitCount: recentCommits24h.length,
            eventCount: recentActivity24h.length,
            mostActiveRepo: mostActiveToday ? mostActiveToday[0] : null,
            commits: commitSummary24h,
            events: eventSummary24h,
        },
        streak: streak > 1 ? `${streak} days` : null,
        skills: SKILLS.map(s => s.skills.slice(0, 3).join(", ")).join(" | "),
    };
}

/**
 * Generate content using Gemini API
 */
async function generateWithGemini(
    context: Awaited<ReturnType<typeof buildContext>>,
    personalityId: string = "tabloid"
): Promise<typeof FALLBACK_CONTENT | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const personality = NEWS_AGENT.personalities.find(p => p.id === personalityId) || NEWS_AGENT.personalities[0];

    // UPDATED PROMPT: Combining History + Daily Context
    const prompt = `You are ${NEWS_AGENT.name}, an AI news agent.
Current Time: ${context.todayDate}
Style/Personality: ${personality.prompt}

=== DAILY UPDATE (LAST 24 HOURS in IST) ===
Commits Today: ${context.activityInLast24h.commitCount}
Events Today: ${context.activityInLast24h.eventCount}
Active Repo Today: ${context.activityInLast24h.mostActiveRepo || "None"}

RECENT ACTIVITY LOG:
${context.activityInLast24h.commits}
${context.activityInLast24h.events}

=== HISTORICAL PROFILE (THE BIG PICTURE) ===
Total Repos: ${context.repoCount} (Stars: ${context.totalStars})
Top Languages: ${context.topLanguages}
Featured Projects: ${context.featuredRepos}
Oldest Project: ${context.oldestActiveRepo}
Dormant/Abandoned Projects: ${context.dormantRepos || "None (Everything is fresh!)"}
Current Streak: ${context.streak || "No active streak"}

=== GLOBAL CONTEXT ===
Developer: ${context.name}
${context.holidays ? `Special Occasion: ${context.holidays}` : ""}
Skills: ${context.skills}

INSTRUCTIONS:
Generate a newspaper edition in JSON.
1. Use the provided context data (Daily Update + Historical Profile) to generate the content.
2. Fully adopt the persona of ${personality.name}.
3. Reference specific repo names, commit messages, and timestamps from the data where relevant.

RESPOND ONLY WITH VALID JSON:
{"headline":"...","subheadline":"...","bodyContent":["...","...","..."],"pullQuote":"...","location":"..."}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}/${MODEL}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 2048,
                    responseMimeType: "application/json", // Force JSON output
                },
            }),
        });

        if (!response.ok) {
            console.error("Gemini API error:", response.status, await response.text());
            return null;
        }

        const data: GeminiResponse = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("No content in Gemini response");
            return null;
        }

        // Remove markdown code blocks if present
        let cleanText = text
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();

        // Try to find a complete JSON object
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON found in response:", text.substring(0, 200));
            return null;
        }

        try {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                headline: parsed.headline || FALLBACK_CONTENT.headline,
                subheadline: parsed.subheadline || FALLBACK_CONTENT.subheadline,
                bodyContent: JSON.stringify(parsed.bodyContent || JSON.parse(FALLBACK_CONTENT.bodyContent)),
                pullQuote: parsed.pullQuote || FALLBACK_CONTENT.pullQuote,
                location: parsed.location || FALLBACK_CONTENT.location,
            };
        } catch (parseError) {
            console.error("JSON parse failed, response may be truncated:", text.substring(0, 300));
            return null;
        }
    } catch (error) {
        console.error("Failed to generate with Gemini:", error);
        return null;
    }
}

/**
 * GET: Retrieve active edition for today or specific edition by ID
 * Priority: 1) Specific ID 2) Active for today 3) Any active 4) Any fallback
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        // If ID is provided, fetch that specific edition
        if (id) {
            const edition = await prisma.newspaperEdition.findUnique({
                where: { id },
            });
            if (edition) {
                return NextResponse.json({
                    ...edition,
                    bodyContent: JSON.parse(edition.bodyContent),
                });
            }
        }

        const todayStart = getStartOfDayIST();
        const todayEnd = getEndOfDayIST();

        // 1. Try to get active edition for today
        let edition = await prisma.newspaperEdition.findFirst({
            where: {
                date: { gte: todayStart, lte: todayEnd },
                isActive: true,
            },
        });

        // 2. Try any active edition
        if (!edition) {
            edition = await prisma.newspaperEdition.findFirst({
                where: { isActive: true },
                orderBy: { date: "desc" },
            });
        }

        // 3. Try any fallback
        if (!edition) {
            edition = await prisma.newspaperEdition.findFirst({
                where: { isFallback: true },
                orderBy: { date: "desc" },
            });
        }

        if (!edition) {
            // Return hardcoded fallback
            return NextResponse.json({
                bodyContent: JSON.parse(FALLBACK_CONTENT.bodyContent),
                date: todayStart.toISOString(),
                isFallback: true,
            });
        }

        return NextResponse.json({
            ...edition,
            bodyContent: JSON.parse(edition.bodyContent),
        });
    } catch (error) {
        console.error("Failed to get newspaper edition:", error);
        return NextResponse.json({
            ...FALLBACK_CONTENT,
            bodyContent: JSON.parse(FALLBACK_CONTENT.bodyContent),
            date: new Date().toISOString(),
            isFallback: true,
            agentName: NEWS_AGENT.name,
            personality: "tabloid"
        });
    }
}

/**
 * POST: Generate new edition variant (admin only)
 * Creates a NEW edition (doesn't replace existing) and sets it as active
 */
export async function POST(request: Request) {
    try {
        // Verify admin session
        const isAdmin = await verifyAdminCookie();
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const personalityId = body.personalityId || "tabloid";

        const context = await buildContext();
        const generated = await generateWithGemini(context, personalityId);

        const now = new Date();
        const startOfToday = getStartOfDayIST(now);
        const endOfToday = getEndOfDayIST(now);

        const content = generated || FALLBACK_CONTENT;

        // Deactivate all editions for today
        await prisma.newspaperEdition.updateMany({
            where: {
                date: { gte: startOfToday, lte: endOfToday },
            },
            data: { isActive: false },
        });

        // Create new edition (variant) and set as active
        const edition = await prisma.newspaperEdition.create({
            data: {
                date: now, // Store the exact generation time
                headline: content.headline,
                subheadline: content.subheadline,
                bodyContent: typeof content.bodyContent === "string"
                    ? content.bodyContent
                    : JSON.stringify(content.bodyContent),
                pullQuote: content.pullQuote,
                location: content.location || "VØID",
                isActive: true, // Auto-activate new edition
                isFallback: false,
                generatedBy: generated ? MODEL : "fallback-content",
                agentName: NEWS_AGENT.name,
                personality: personalityId,
            },
        });

        return NextResponse.json({
            success: true,
            ...edition,
            bodyContent: JSON.parse(edition.bodyContent),
        });
    } catch (error) {
        console.error("Failed to generate newspaper edition:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate edition" },
            { status: 500 }
        );
    }
}
