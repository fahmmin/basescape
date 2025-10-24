/**
 * Simple in-memory rate limiter for IP addresses
 * Used to prevent comment spam
 */

const bucket = new Map<string, number>();

/**
 * Check if an IP address is rate limited
 * Returns true if the request should be allowed, false if blocked
 */
export function limitIp(ip: string, windowMs: number = 10_000): boolean {
    const now = Date.now();
    const last = bucket.get(ip) ?? 0;

    if (now - last < windowMs) {
        return false; // Rate limited
    }

    bucket.set(ip, now);
    return true; // Allow request
}

/**
 * Clear old entries from the bucket periodically
 * Call this in a background task or on server startup
 */
export function cleanupRateLimitBucket(maxAgeMs: number = 60_000): void {
    const now = Date.now();
    for (const [ip, timestamp] of bucket.entries()) {
        if (now - timestamp > maxAgeMs) {
            bucket.delete(ip);
        }
    }
}

