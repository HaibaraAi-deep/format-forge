import { describe, it, expect } from 'vitest';
import { encodeToBase64, decodeFromBase64 } from '@/services/converters/base64';

describe('base64', () => {
  describe('encodeToBase64', () => {
    it('should encode ASCII text', () => {
      const result = encodeToBase64('Hello, World!');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('SGVsbG8sIFdvcmxkIQ==');
      }
    });

    it('should encode Unicode text', () => {
      const result = encodeToBase64('你好世界');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeTruthy();
      }
    });

    it('should return error for empty input', () => {
      const result = encodeToBase64('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });
  });

  describe('decodeFromBase64', () => {
    it('should decode base64 string', () => {
      const result = decodeFromBase64('SGVsbG8sIFdvcmxkIQ==');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Hello, World!');
      }
    });

    it('should round-trip encode/decode', () => {
      const original = 'Test 123 你好 🎉';
      const encoded = encodeToBase64(original);
      expect(encoded.success).toBe(true);
      if (encoded.success) {
        const decoded = decodeFromBase64(encoded.data);
        expect(decoded.success).toBe(true);
        if (decoded.success) {
          expect(decoded.data).toBe(original);
        }
      }
    });

    it('should return error for empty input', () => {
      const result = decodeFromBase64('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });
  });
});
