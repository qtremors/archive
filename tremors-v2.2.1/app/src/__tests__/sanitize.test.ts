/**
 * Tests for sanitize.ts
 */

import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeArg, isValidRepoName } from '../lib/sanitize';

describe('sanitizeInput', () => {
    it('should return empty string for empty input', () => {
        expect(sanitizeInput('')).toBe('');
    });

    it('should trim whitespace', () => {
        expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should encode HTML entities', () => {
        expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        );
    });

    it('should remove control characters', () => {
        expect(sanitizeInput('hello\x00world')).toBe('helloworld');
    });

    it('should limit length to 500 characters', () => {
        const longString = 'a'.repeat(600);
        expect(sanitizeInput(longString).length).toBeLessThanOrEqual(500);
    });
});

describe('sanitizeArg', () => {
    it('should return empty string for empty input', () => {
        expect(sanitizeArg('')).toBe('');
    });

    it('should only allow alphanumeric, dash, underscore, dot', () => {
        expect(sanitizeArg('hello-world_123.test')).toBe('hello-world_123.test');
        expect(sanitizeArg('hello@world!')).toBe('helloworld');
    });

    it('should limit length to 100 characters', () => {
        const longString = 'a'.repeat(150);
        expect(sanitizeArg(longString).length).toBe(100);
    });
});

describe('isValidRepoName', () => {
    it('should return true for valid repo names', () => {
        expect(isValidRepoName('my-repo')).toBe(true);
        expect(isValidRepoName('my_repo')).toBe(true);
        expect(isValidRepoName('my.repo')).toBe(true);
        expect(isValidRepoName('MyRepo123')).toBe(true);
    });

    it('should return false for invalid repo names', () => {
        expect(isValidRepoName('my repo')).toBe(false);
        expect(isValidRepoName('my@repo')).toBe(false);
        expect(isValidRepoName('')).toBe(false);
    });

    it('should reject names longer than 100 characters', () => {
        const longName = 'a'.repeat(101);
        expect(isValidRepoName(longName)).toBe(false);
    });
});
