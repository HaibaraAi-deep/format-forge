import { describe, it, expect } from 'vitest';
import { formatNumber, formatDuration, formatByteSize } from '@/utils/format';

describe('format utils', () => {
  describe('formatNumber', () => {
    it('should format with default 2 decimals', () => {
      expect(formatNumber(3.14159)).toBe('3.14');
    });

    it('should format with custom decimals', () => {
      expect(formatNumber(3.14159, 4)).toBe('3.1416');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(1500)).toBe('1.50s');
    });

    it('should format zero', () => {
      expect(formatDuration(0)).toBe('0ms');
    });
  });

  describe('formatByteSize', () => {
    it('should format bytes', () => {
      expect(formatByteSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatByteSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatByteSize(2 * 1024 * 1024)).toBe('2.0 MB');
    });
  });
});
