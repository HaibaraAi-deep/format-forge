import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, validateJson } from '@/services/converters/json-formatter';

describe('json-formatter', () => {
  describe('formatJson', () => {
    it('should format JSON with 2-space indent', () => {
      const result = formatJson('{"a":1,"b":2}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('{\n  "a": 1,\n  "b": 2\n}');
      }
    });

    it('should format JSON with custom indent', () => {
      const result = formatJson('{"a":1}', 4);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('{\n    "a": 1\n}');
      }
    });

    it('should return error for invalid JSON', () => {
      const result = formatJson('{invalid}');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_JSON');
      }
    });

    it('should return error for empty input', () => {
      const result = formatJson('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });
  });

  describe('minifyJson', () => {
    it('should minify formatted JSON', () => {
      const result = minifyJson('{\n  "a": 1,\n  "b": 2\n}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('{"a":1,"b":2}');
      }
    });
  });

  describe('validateJson', () => {
    it('should validate correct JSON', () => {
      const result = validateJson('{"key": "value"}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(true);
      }
    });

    it('should report invalid JSON', () => {
      const result = validateJson('{bad json}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
      }
    });
  });
});
