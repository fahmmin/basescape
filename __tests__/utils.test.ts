/**
 * Basic tests for utility functions
 * Run with: yarn test (after installing jest)
 */

import { voteHash, messageFor } from '../lib/crypto';
import { timeDecay, computeHype } from '../lib/hype';
import { limitIp } from '../lib/ratelimit';

describe('Crypto Utils', () => {
    test('voteHash generates consistent hash', () => {
        const hash1 = voteHash({
            wallet: '0x1234',
            postId: 'post123',
            serverSalt: 'test-salt',
        });
        const hash2 = voteHash({
            wallet: '0x1234',
            postId: 'post123',
            serverSalt: 'test-salt',
        });
        expect(hash1).toBe(hash2);
        expect(hash1).toBeTruthy();
    });

    test('voteHash normalizes wallet address', () => {
        const hash1 = voteHash({
            wallet: '0xABCD',
            postId: 'post123',
            serverSalt: 'test-salt',
        });
        const hash2 = voteHash({
            wallet: '0xabcd',
            postId: 'post123',
            serverSalt: 'test-salt',
        });
        expect(hash1).toBe(hash2);
    });

    test('messageFor generates correct messages', () => {
        expect(messageFor('create')).toBe('create:culturedrop');
        expect(messageFor('vote', 'post123')).toBe('vote:post123');
    });
});

describe('Hype Utils', () => {
    test('timeDecay returns 1 for new posts', () => {
        const now = new Date();
        const decay = timeDecay(now, 7);
        expect(decay).toBeCloseTo(1, 2);
    });

    test('timeDecay decreases over time', () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const decay = timeDecay(sevenDaysAgo, 7);
        expect(decay).toBeCloseTo(0.5, 2);
    });

    test('computeHype calculates score correctly', () => {
        const score = computeHype({
            upvotes: 10,
            uniqueCommenters: 4,
            createdAt: new Date(),
        });
        // 1.0 * 10 + 0.3 * sqrt(4) + 2.0 * 1 = 10 + 0.6 + 2 = 12.6
        expect(score).toBeGreaterThan(12);
        expect(score).toBeLessThan(13);
    });
});

describe('Rate Limit Utils', () => {
    test('limitIp allows first request', () => {
        const result = limitIp('192.168.1.1', 10_000);
        expect(result).toBe(true);
    });

    test('limitIp blocks repeated requests', () => {
        const ip = '192.168.1.2';
        limitIp(ip, 10_000); // First request
        const result = limitIp(ip, 10_000); // Second request immediately after
        expect(result).toBe(false);
    });
});

