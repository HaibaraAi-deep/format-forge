import { describe, it, expect } from 'vitest';
import { isValidJson, isValidBase64, isValidHexColor, isValidJwt } from '@/utils/validation';

describe('validation utils', () => {
  describe('isValidJson', () => {
    it('should validate correct JSON', () => {
      expect(isValidJson('{"key": "value"}')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(isValidJson('{invalid}')).toBe(false);
    });

    it('should validate JSON arrays', () => {
      expect(isValidJson('[1, 2, 3]')).toBe(true);
    });
  });

  describe('isValidBase64', () => {
    it('should validate correct Base64', () => {
      expect(isValidBase64('SGVsbG8=')).toBe(true);
    });

    it('should reject invalid Base64', () => {
      expect(isValidBase64('Hello!')).toBe(false);
    });

    it('should reject wrong padding length', () => {
      expect(isValidBase64('SGVsbG8')).toBe(false);
    });
  });

  describe('isValidHexColor', () => {
    it('should validate 3-digit hex', () => {
      expect(isValidHexColor('#f00')).toBe(true);
    });

    it('should validate 6-digit hex', () => {
      expect(isValidHexColor('#ff0000')).toBe(true);
    });

    it('should validate 8-digit hex', () => {
      expect(isValidHexColor('#ff000080')).toBe(true);
    });

    it('should reject invalid hex', () => {
      expect(isValidHexColor('red')).toBe(false);
    });
  });

  describe('isValidJwt', () => {
    it('should validate JWT format', () => {
      expect(isValidJwt('a.b.c')).toBe(true);
    });

    it('should reject non-JWT strings', () => {
      expect(isValidJwt('a.b')).toBe(false);
      expect(isValidJwt('a.b.c.d')).toBe(false);
    });
  });
});
