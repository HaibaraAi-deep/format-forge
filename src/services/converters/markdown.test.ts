import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '@/services/converters/markdown';

describe('markdown', () => {
  it('should convert markdown to HTML', () => {
    const result = markdownToHtml('**bold**');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toContain('<strong>bold</strong>');
    }
  });

  it('should sanitize XSS in markdown', () => {
    const result = markdownToHtml('<img src=x onerror=alert(1)>');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toContain('onerror');
    }
  });

  it('should return error for empty input', () => {
    const result = markdownToHtml('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });

  it('should support GFM features', () => {
    const result = markdownToHtml('| a | b |\n|---|---|\n| 1 | 2 |');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toContain('<table>');
    }
  });
});
