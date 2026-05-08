import { describe, it, expect } from 'vitest';
import { parseJwt } from '@/services/converters/jwt';

describe('jwt', () => {
  it('should parse a valid JWT', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: '1234567890', name: 'John Doe' }));
    const token = `${header}.${payload}.signature`;

    const result = parseJwt(token);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.header).toEqual({ alg: 'HS256', typ: 'JWT' });
      expect(result.data.payload).toEqual({ sub: '1234567890', name: 'John Doe' });
      expect(result.data.signature).toBe('signature');
    }
  });

  it('should detect expired JWT', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ exp: 1 }));
    const token = `${header}.${payload}.sig`;

    const result = parseJwt(token);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isExpired).toBe(true);
    }
  });

  it('should return error for empty input', () => {
    const result = parseJwt('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });

  it('should return error for invalid JWT format', () => {
    const result = parseJwt('not.a.valid.jwt.token');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_JWT');
    }
  });

  it('should return error for JWT with wrong number of parts', () => {
    const result = parseJwt('only.two');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_JWT');
    }
  });
});
