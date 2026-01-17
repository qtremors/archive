/**
 * Input Sanitization Utilities
 * Prevents XSS and injection attacks in terminal commands
 */

// Sanitize user input by removing potentially dangerous characters
export function sanitizeInput(input: string): string {
    if (!input) return "";

    // Limit length to prevent DoS
    const maxLength = 500;
    let sanitized = input.slice(0, maxLength);

    // Remove control characters except newline and tab
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Encode HTML entities to prevent XSS
    sanitized = sanitized
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");

    return sanitized.trim();
}

// Sanitize command arguments (more strict)
export function sanitizeArg(arg: string): string {
    if (!arg) return "";

    // Only allow alphanumeric, dash, underscore, dot
    return arg.replace(/[^a-zA-Z0-9\-_.]/g, "").slice(0, 100);
}

// Validate repo name format
export function isValidRepoName(name: string): boolean {
    // GitHub repo names: alphanumeric, dash, underscore, dot
    return /^[a-zA-Z0-9\-_.]+$/.test(name) && name.length <= 100;
}
