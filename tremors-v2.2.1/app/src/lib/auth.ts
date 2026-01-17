/**
 * Admin Authentication Utilities
 * Handles secure password hashing, session management, and admin CRUD
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

// Constants
const ADMIN_COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

// Get signing secret (auto-generate if not set)
function getSigningSecret(): string {
    const secret = process.env.AUTH_SECRET;
    if (secret && secret.length >= 32) {
        return secret;
    }

    if (process.env.NODE_ENV === "production" && !secret) {
        throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET is missing in production! System cannot start without a secure secret. Please set AUTH_SECRET in your environment.");
    }

    // Fallback for development/preview: derive from multiple env vars for better entropy
    const derived = [
        process.env.ADMIN_SECRET || "",
        process.env.DATABASE_URL || "",
        process.env.NODE_ENV || "",
        "tremors-auth-v1"
    ].join("-");
    return crypto.createHash("sha256").update(derived).digest("hex");
}

// ============================================
// Password Hashing
// ============================================

/**
 * Hash a password with a random salt using PBKDF2
 */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
        .toString("hex");
    return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 */
export function verifyPassword(password: string, stored: string): boolean {
    try {
        const [salt, storedHash] = stored.split(":");
        if (!salt || !storedHash) return false;

        const hash = crypto
            .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
            .toString("hex");

        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(hash));
    } catch {
        return false;
    }
}

// ============================================
// Admin Account Management
// ============================================

/**
 * Check if an admin account exists in the database
 */
export async function adminExists(): Promise<boolean> {
    const admin = await prisma.admin.findUnique({
        where: { id: "main" },
    });
    return admin !== null;
}

/**
 * Create the admin account with a hashed password
 * Only works if no admin exists
 */
export async function createAdmin(password: string): Promise<boolean> {
    const exists = await adminExists();
    if (exists) {
        return false; // Admin already exists
    }

    const passwordHash = hashPassword(password);
    await prisma.admin.create({
        data: {
            id: "main",
            passwordHash,
        },
    });
    return true;
}

/**
 * Verify admin password and return success
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
    const admin = await prisma.admin.findUnique({
        where: { id: "main" },
    });

    if (!admin) {
        return false;
    }

    return verifyPassword(password, admin.passwordHash);
}

/**
 * Change admin password (requires current password verification)
 */
export async function changeAdminPassword(
    currentPassword: string,
    newPassword: string
): Promise<boolean> {
    const isValid = await verifyAdminPassword(currentPassword);
    if (!isValid) {
        return false;
    }

    const newHash = hashPassword(newPassword);
    await prisma.admin.update({
        where: { id: "main" },
        data: { passwordHash: newHash },
    });
    return true;
}

// ============================================
// Session Token Management (Signed)
// ============================================

/**
 * Create a signed session token
 */
function createSessionToken(): string {
    const payload = {
        admin: true,
        timestamp: Date.now(),
        nonce: crypto.randomBytes(8).toString("hex"),
    };
    const data = JSON.stringify(payload);
    const signature = crypto
        .createHmac("sha256", getSigningSecret())
        .update(data)
        .digest("hex");
    return `${Buffer.from(data).toString("base64")}.${signature}`;
}

/**
 * Verify a signed session token
 */
function verifySessionToken(token: string): boolean {
    try {
        const parts = token.split(".");
        if (parts.length !== 2) return false;

        const [data, signature] = parts;
        const payload = Buffer.from(data, "base64").toString("utf-8");

        // Verify signature with timing-safe comparison
        const expectedSig = crypto
            .createHmac("sha256", getSigningSecret())
            .update(payload)
            .digest("hex");

        // Use timing-safe comparison to prevent timing attacks
        if (signature.length !== expectedSig.length) return false;
        const sigBuffer = Buffer.from(signature, "hex");
        const expectedBuffer = Buffer.from(expectedSig, "hex");
        if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

        // Verify expiry
        const decoded = JSON.parse(payload);
        if (decoded.admin !== true) return false;

        const age = Date.now() - decoded.timestamp;
        return age < COOKIE_MAX_AGE * 1000;
    } catch {
        return false;
    }
}

// ============================================
// Cookie Management
// ============================================

/**
 * Set admin session cookie (called after successful authentication)
 */
export async function setAdminCookie(): Promise<void> {
    const cookieStore = await cookies();
    const sessionToken = createSessionToken();

    cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
}

/**
 * Clear admin session cookie (called on logout)
 */
export async function clearAdminCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Verify admin session cookie
 * Returns true if valid admin session exists
 */
export async function verifyAdminCookie(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(ADMIN_COOKIE_NAME);

        if (!cookie?.value) {
            return false;
        }

        return verifySessionToken(cookie.value);
    } catch {
        return false;
    }
}

/**
 * Get session info for display
 */
export async function getSessionInfo(): Promise<{ expiresIn: number } | null> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(ADMIN_COOKIE_NAME);

        if (!cookie?.value) return null;

        const parts = cookie.value.split(".");
        if (parts.length !== 2) return null;

        const payload = JSON.parse(Buffer.from(parts[0], "base64").toString("utf-8"));
        const age = Date.now() - payload.timestamp;
        const remaining = COOKIE_MAX_AGE * 1000 - age;

        if (remaining <= 0) return null;

        return { expiresIn: Math.floor(remaining / 1000) };
    } catch {
        return null;
    }
}
