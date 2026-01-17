/**
 * API Route: /api/admin/resume
 * Upload and manage resume PDF via Vercel Blob
 */

import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db";

const FALLBACK_RESUME_URL = "/Aman_Singh.pdf";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * GET: Return current resume URL
 */
export async function GET() {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: "main" },
            select: { resumeUrl: true },
        });

        return NextResponse.json({
            url: settings?.resumeUrl || FALLBACK_RESUME_URL,
            isBlobUrl: !!settings?.resumeUrl,
        });
    } catch (error) {
        console.error("Failed to get resume URL:", error);
        return NextResponse.json({ url: FALLBACK_RESUME_URL, isBlobUrl: false });
    }
}

/**
 * POST: Upload new resume PDF to Vercel Blob
 */
export async function POST(request: Request) {
    try {
        // Check admin auth
        const authCookie = request.headers.get("cookie")?.includes("admin_session");
        if (!authCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
        }

        // Get current resume URL to delete old blob
        const currentSettings = await prisma.settings.findUnique({
            where: { id: "main" },
            select: { resumeUrl: true },
        });

        // Delete old blob if exists
        if (currentSettings?.resumeUrl) {
            try {
                await del(currentSettings.resumeUrl);
            } catch {
                // Ignore deletion errors (blob might not exist)
            }
        }

        // Upload new file to Vercel Blob with original filename
        const blob = await put(file.name, file, {
            access: "public",
            addRandomSuffix: false, // Keep exact original filename
        });

        // Update settings with new URL
        await prisma.settings.upsert({
            where: { id: "main" },
            update: { resumeUrl: blob.url },
            create: { id: "main", resumeUrl: blob.url },
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
        });
    } catch (error) {
        console.error("Failed to upload resume:", error);
        return NextResponse.json(
            { error: "Failed to upload resume" },
            { status: 500 }
        );
    }
}
