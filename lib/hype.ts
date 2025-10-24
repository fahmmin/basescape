/**
 * Calculate time decay factor for hype score
 * Uses exponential decay with configurable half-life
 */
export function timeDecay(createdAt: Date, halfLifeDays: number = 7): number {
    const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.pow(0.5, ageDays / halfLifeDays);
}

/**
 * Compute hype score for a culture drop
 * Formula: 1.0 * upvotes + 0.3 * sqrt(uniqueCommenters) + 2.0 * timeDecay
 */
export function computeHype({
    upvotes,
    uniqueCommenters,
    createdAt,
}: {
    upvotes: number;
    uniqueCommenters: number;
    createdAt: Date;
}): number {
    return (
        1.0 * upvotes +
        0.3 * Math.sqrt(uniqueCommenters) +
        2.0 * timeDecay(createdAt, 7)
    );
}

