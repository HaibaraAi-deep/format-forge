import { describe, it, expect } from 'vitest';
import { getFileExtension, formatFileSize } from '@/utils/file';

describe('file utils', () => {
  describe('getFileExtension', () => {
    it('should extract extension', () => {
      expect(getFileExtension('test.json')).toBe('json');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should return empty for no extension', () => {
      expect(getFileExtension('README')).toBe('');
    });

    it('should lowercase extension', () => {
      expect(getFileExtension('file.JSON')).toBe('json');
    });
  });

  describe('formatFileSize', () => {
    it('should format zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes', () => {
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });
  });
});
