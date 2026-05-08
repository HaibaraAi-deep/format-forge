import { describe, it, expect } from 'vitest';
import { encodeUrl, decodeUrl, parseQueryParams, buildQueryParams } from '@/services/converters/url';

describe('url', () => {
  describe('encodeUrl', () => {
    it('should encode URL special characters', () => {
      const result = encodeUrl('hello world&foo=bar');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello%20world%26foo%3Dbar');
      }
    });

    it('should return error for empty input', () => {
      const result = encodeUrl('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });
  });

  describe('decodeUrl', () => {
    it('should decode URL-encoded string', () => {
      const result = decodeUrl('hello%20world');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello world');
      }
    });
  });

  describe('parseQueryParams', () => {
    it('should parse query string', () => {
      const result = parseQueryParams('foo=bar&baz=qux');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ foo: 'bar', baz: 'qux' });
      }
    });

    it('should parse query string with leading ?', () => {
      const result = parseQueryParams('?foo=bar');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ foo: 'bar' });
      }
    });
  });

  describe('buildQueryParams', () => {
    it('should build query string from params', () => {
      const result = buildQueryParams({ foo: 'bar', baz: 'qux' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('foo=bar');
        expect(result.data).toContain('baz=qux');
      }
    });
  });
});
