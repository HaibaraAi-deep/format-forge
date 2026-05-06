import type { Result } from '@/types';

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding === 2) {
    base64 += '==';
  } else if (padding === 3) {
    base64 += '=';
  }

  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error('Invalid Base64URL encoding');
  }
}

export function parseJwt(
  token: string
): Result<{
  header: object;
  payload: object;
  signature: string;
  isExpired: boolean;
  expiresAt?: string;
}> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(token).length;

  if (!token || !token.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'JWT token is empty' },
    };
  }

  const parts = token.trim().split('.');

  if (parts.length !== 3) {
    return {
      success: false,
      error: {
        code: 'INVALID_JWT',
        message: 'JWT must have 3 parts separated by dots',
        details: `Found ${parts.length} part(s) instead of 3`,
      },
    };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const header = JSON.parse(headerJson);

    if (typeof header !== 'object' || header === null || Array.isArray(header)) {
      return {
        success: false,
        error: { code: 'INVALID_JWT_HEADER', message: 'JWT header is not a valid JSON object' },
      };
    }
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'INVALID_JWT_HEADER',
        message: 'Failed to decode JWT header',
        details: e instanceof Error ? e.message : 'Invalid Base64URL or JSON',
      },
    };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const header = JSON.parse(headerJson);
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
      return {
        success: false,
        error: { code: 'INVALID_JWT_PAYLOAD', message: 'JWT payload is not a valid JSON object' },
      };
    }

    const signature = parts[2];

    let isExpired = false;
    let expiresAt: string | undefined;

    if (typeof payload.exp === 'number') {
      const expiryDate = new Date(payload.exp * 1000);
      expiresAt = expiryDate.toISOString();
      isExpired = Date.now() > payload.exp * 1000;
    }

    const result = {
      header,
      payload,
      signature,
      isExpired,
      ...(expiresAt !== undefined && { expiresAt }),
    };

    const outputSize = new TextEncoder().encode(JSON.stringify(result)).length;

    return {
      success: true,
      data: result,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'INVALID_JWT_PAYLOAD',
        message: 'Failed to decode JWT payload',
        details: e instanceof Error ? e.message : 'Invalid Base64URL or JSON',
      },
    };
  }
}
