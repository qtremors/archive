/**
 * Tests for auth.ts - password hashing
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/auth';

describe('Password Hashing', () => {
    it('should hash a password', () => {
        const hash = hashPassword('testpassword');
        expect(hash).toBeDefined();
        expect(hash).toContain(':'); // salt:hash format
    });

    it('should create different hashes for same password', () => {
        const hash1 = hashPassword('testpassword');
        const hash2 = hashPassword('testpassword');
        expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should verify correct password', () => {
        const password = 'testpassword123';
        const hash = hashPassword(password);
        expect(verifyPassword(password, hash)).toBe(true);
    });

    it('should reject incorrect password', () => {
        const hash = hashPassword('correctpassword');
        expect(verifyPassword('wrongpassword', hash)).toBe(false);
    });

    it('should handle invalid hash format', () => {
        expect(verifyPassword('password', 'invalidhash')).toBe(false);
        expect(verifyPassword('password', '')).toBe(false);
    });
});
