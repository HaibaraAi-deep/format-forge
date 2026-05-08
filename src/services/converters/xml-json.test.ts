import { describe, it, expect } from 'vitest';
import { xmlToJson, jsonToXml } from '@/services/converters/xml-json';

describe('xml-json', () => {
  describe('xmlToJson', () => {
    it('should convert simple XML to JSON', () => {
      const result = xmlToJson('<root><name>test</name></root>');
      expect(result.success).toBe(true);
      if (result.success) {
        const parsed = JSON.parse(result.data);
        expect(parsed.root.name).toBeDefined();
      }
    });

    it('should return error for empty input', () => {
      const result = xmlToJson('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });

    it('should handle malformed XML gracefully', () => {
      const result = xmlToJson('<root><unclosed>');
      expect(result.success).toBe(true);
    });
  });

  describe('jsonToXml', () => {
    it('should convert JSON to XML', () => {
      const result = jsonToXml('{"root":{"name":"test"}}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('<name>test</name>');
      }
    });

    it('should return error for non-object JSON', () => {
      const result = jsonToXml('"string"');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_JSON');
      }
    });
  });
});
