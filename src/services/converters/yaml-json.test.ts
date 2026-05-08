import { describe, it, expect } from 'vitest';
import { yamlToJson, jsonToYaml } from '@/services/converters/yaml-json';

describe('yaml-json', () => {
  describe('yamlToJson', () => {
    it('should convert simple YAML to JSON', () => {
      const result = yamlToJson('name: test\nvalue: 123');
      expect(result.success).toBe(true);
      if (result.success) {
        const parsed = JSON.parse(result.data);
        expect(parsed.name).toBe('test');
        expect(parsed.value).toBe(123);
      }
    });

    it('should return error for empty input', () => {
      const result = yamlToJson('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });

    it('should return error for invalid YAML', () => {
      const result = yamlToJson(':\n  :\n    :');
      expect(result.success).toBe(false);
    });

    it('should reject dangerous YAML types with JSON_SCHEMA', () => {
      const result = yamlToJson('fn: !!js/function "function(){}"');
      expect(result.success).toBe(false);
    });
  });

  describe('jsonToYaml', () => {
    it('should convert JSON to YAML', () => {
      const result = jsonToYaml('{"name":"test","value":123}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('name: test');
        expect(result.data).toContain('value: 123');
      }
    });

    it('should return error for invalid JSON', () => {
      const result = jsonToYaml('{invalid}');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_JSON');
      }
    });
  });
});
