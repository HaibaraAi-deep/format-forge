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
    throw new Error('无效的 Base64URL 编码');
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
      error: { code: 'EMPTY_INPUT', message: 'JWT 令牌为空' },
    };
  }

  const parts = token.trim().split('.');

  if (parts.length !== 3) {
    return {
      success: false,
      error: {
        code: 'INVALID_JWT',
        message: 'JWT 必须由三部分以点号分隔',
        details: `发现 ${parts.length} 个部分，应为 3 个`,
      },
    };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const header = JSON.parse(headerJson);

    if (typeof header !== 'object' || header === null || Array.isArray(header)) {
      return {
        success: false,
        error: { code: 'INVALID_JWT_HEADER', message: 'JWT 头部不是有效的 JSON 对象' },
      };
    }
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'INVALID_JWT_HEADER',
        message: 'JWT 头部解码失败',
        details: e instanceof Error ? e.message : '无效的 Base64URL 或 JSON',
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
        error: { code: 'INVALID_JWT_PAYLOAD', message: 'JWT 载荷不是有效的 JSON 对象' },
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
        message: 'JWT 载荷解码失败',
        details: e instanceof Error ? e.message : '无效的 Base64URL 或 JSON',
      },
    };
  }
}
