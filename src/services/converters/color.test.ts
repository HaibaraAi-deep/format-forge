import { describe, it, expect } from 'vitest';
import { parseColor } from '@/services/converters/color';

describe('color', () => {
  it('should parse hex color', () => {
    const result = parseColor('#ff0000');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rgb.r).toBe(255);
      expect(result.data.rgb.g).toBe(0);
      expect(result.data.rgb.b).toBe(0);
    }
  });

  it('should parse short hex color', () => {
    const result = parseColor('#f00');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rgb.r).toBe(255);
    }
  });

  it('should parse rgb color', () => {
    const result = parseColor('rgb(0, 128, 255)');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rgb.r).toBe(0);
      expect(result.data.rgb.g).toBe(128);
      expect(result.data.rgb.b).toBe(255);
    }
  });

  it('should return error for invalid color', () => {
    const result = parseColor('not-a-color');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_COLOR');
    }
  });

  it('should return error for empty input', () => {
    const result = parseColor('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });
});
