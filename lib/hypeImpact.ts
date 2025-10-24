/**
 * Calculate impact of articles on nearby drops based on location
 */

interface Article {
    impactTag: 'good' | 'bad' | 'worse';
    impactMultiplier: number;
    linkedLocation?: {
        coordinates?: [number, number];
        radius?: number;
    };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
    coords1: [number, number],
    coords2: [number, number]
): number {
    const [lng1, lat1] = coords1;
    const [lng2, lat2] = coords2;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Calculate total impact multiplier for a drop based on nearby articles
 */
export function calculateLocationImpact(
    dropCoordinates: [number, number],
    articles: Article[]
): number {
    let totalMultiplier = 1.0;

    for (const article of articles) {
        if (!article.linkedLocation?.coordinates) continue;

        const distance = calculateDistance(
            dropCoordinates,
            article.linkedLocation.coordinates
        );

        const radius = article.linkedLocation.radius || 5000; // Default 5km

        // If within radius, apply impact
        if (distance <= radius) {
            // Distance-based decay: closer = stronger impact
            const decayFactor = 1 - distance / radius;
            const adjustedMultiplier =
                1 + (article.impactMultiplier - 1) * decayFactor;

            totalMultiplier *= adjustedMultiplier;
        }
    }

    // Cap the impact to prevent extreme values
    return Math.max(0.1, Math.min(3.0, totalMultiplier));
}

/**
 * Get severity description for impact tag
 */
export function getImpactDescription(tag: 'good' | 'bad' | 'worse'): string {
    switch (tag) {
        case 'good':
            return 'Positive impact - boosts nearby locations';
        case 'bad':
            return 'Negative impact - reduces hype of nearby locations';
        case 'worse':
            return 'Severe negative impact - significantly reduces nearby hype';
        default:
            return 'Neutral';
    }
}

/**
 * Get color for impact tag
 */
export function getImpactColor(
    tag: 'good' | 'bad' | 'worse'
): string {
    switch (tag) {
        case 'good':
            return '#97F0E5'; // Cyan
        case 'bad':
            return '#FFA500'; // Orange
        case 'worse':
            return '#FF4444'; // Red
        default:
            return '#F7F7F7';
    }
}

