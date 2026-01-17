/**
 * Tests for Admin Refresh API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../app/api/admin/refresh/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
    prisma: {
        $transaction: vi.fn((callback) => callback({
            repo: { deleteMany: vi.fn(), upsert: vi.fn(), findMany: vi.fn() },
            commit: { deleteMany: vi.fn(), createMany: vi.fn() },
            activity: { deleteMany: vi.fn(), createMany: vi.fn() },
            settings: { upsert: vi.fn() }
        }))
    }
}));

vi.mock('@/lib/github', () => ({
    getRepos: vi.fn().mockResolvedValue([{ id: 1, name: 'test-repo', full_name: 'user/test-repo', topics: [] }]),
    getRecentCommits: vi.fn().mockResolvedValue([]),
    getActivity: vi.fn().mockResolvedValue([])
}));

vi.mock('@/lib/auth', () => ({
    verifyAdminCookie: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/lib/csrf', () => ({
    validateCsrf: vi.fn().mockReturnValue({ valid: true })
}));

describe('Admin Refresh API', () => {
    it('should successfully sync data', async () => {
        const req = new NextRequest('http://localhost:3000/api/admin/refresh', {
            method: 'POST'
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
    });
});
