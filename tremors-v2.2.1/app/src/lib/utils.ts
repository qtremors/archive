/**
 * Utility functions for data parsing and validation
 */

/**
 * Safely parse topics JSON string with error handling
 * @param topicsJson - JSON string representing an array of topics
 * @returns Parsed array of topics, or empty array on failure
 */
export function parseTopics(topicsJson: string): string[] {
    try {
        const parsed = JSON.parse(topicsJson);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [];
    } catch {
        return [];
    }
}

/**
 * Format project title - converts kebab-case to Title Case
 * "my-cool-project" -> "My Cool Project"
 */
export function formatProjectTitle(name: string): string {
    return name
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}
