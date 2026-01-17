/**
 * Timezone Utility for Tremors Portfolio
 * Centralizes IST (Asia/Kolkata) date handling to prevent off-by-one errors
 * and inconsistent date representations.
 */

export const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Returns YYYY-MM-DD in IST
 */
export function getISTDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

/**
 * Returns year, month, day, hour, minute in IST
 */
export function getISTParts(date: Date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
    }).formatToParts(date);

    const map: Record<string, number> = {};
    parts.forEach((p) => {
        if (p.type !== "literal") {
            map[p.type] = parseInt(p.value, 10);
        }
    });

    return {
        year: map.year,
        month: map.month,
        day: map.day,
        hour: map.hour,
        minute: map.minute,
        second: map.second,
    };
}

/**
 * Returns a Date object representing the start of the day in IST
 * Note: The resulting Date object is always in UTC internally, but 
 * its value corresponds to 00:00:00 in IST.
 */
export function getStartOfDayIST(date: Date = new Date()): Date {
    const { year, month, day } = getISTParts(date);
    // Create a string that can be parsed as a full ISO date in IST
    // We append the IST offset (+05:30) to ensure it's parsed correctly
    const isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00.000+05:30`;
    return new Date(isoString);
}

/**
 * Returns a Date object representing the end of the day in IST
 */
export function getEndOfDayIST(date: Date = new Date()): Date {
    const { year, month, day } = getISTParts(date);
    const isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T23:59:59.999+05:30`;
    return new Date(isoString);
}

/**
 * Formats a date for display in IST
 */
export function formatIST(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: IST_TIMEZONE,
        ...options,
    }).format(date);
}
