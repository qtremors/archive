/**
 * Tests for utils.ts
 */

import { describe, it, expect } from 'vitest';
import { parseTopics } from '../lib/utils';

describe('parseTopics', () => {
    it('should parse valid JSON array', () => {
        const result = parseTopics('["react", "typescript"]');
        expect(result).toEqual(['react', 'typescript']);
    });

    it('should return empty array for invalid JSON', () => {
        const result = parseTopics('not valid json');
        expect(result).toEqual([]);
    });

    it('should return empty array for non-array JSON', () => {
        const result = parseTopics('{"key": "value"}');
        expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
        const result = parseTopics('');
        expect(result).toEqual([]);
    });

    it('should handle empty array', () => {
        const result = parseTopics('[]');
        expect(result).toEqual([]);
    });
});
