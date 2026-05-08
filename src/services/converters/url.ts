import type { Result } from '@/types';

export function encodeUrl(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (input === '') {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入字符串为空' },
    };
  }

  try {
    const encoded = encodeURIComponent(input);
    const outputSize = new TextEncoder().encode(encoded).length;

    return {
      success: true,
      data: encoded,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'ENCODE_ERROR',
        message: 'URL 编码失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}

export function decodeUrl(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 URL 编码字符串为空' },
    };
  }

  try {
    const decoded = decodeURIComponent(input);
    const outputSize = new TextEncoder().encode(decoded).length;

    return {
      success: true,
      data: decoded,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'DECODE_ERROR',
        message: 'URL 解码失败',
        details: e instanceof Error ? e.message : '格式错误的 URI 序列',
      },
    };
  }
}

export function parseQueryParams(input: string): Result<Record<string, string>> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的查询字符串为空' },
    };
  }

  try {
    let queryString = input.trim();
    if (queryString.startsWith('?')) {
      queryString = queryString.slice(1);
    }

    const hashIndex = queryString.indexOf('#');
    if (hashIndex !== -1) {
      queryString = queryString.slice(0, hashIndex);
    }

    const params: Record<string, string> = {};

    if (!queryString) {
      return {
        success: true,
        data: params,
        meta: { processingTime: performance.now() - start, inputSize, outputSize: 2 },
      };
    }

    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const equalIndex = pair.indexOf('=');
      if (equalIndex === -1) {
        if (pair) {
          params[decodeURIComponent(pair)] = '';
        }
      } else {
        const key = decodeURIComponent(pair.slice(0, equalIndex));
        const value = decodeURIComponent(pair.slice(equalIndex + 1));
        params[key] = value;
      }
    }

    const outputSize = new TextEncoder().encode(JSON.stringify(params)).length;

    return {
      success: true,
      data: params,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse query parameters',
        details: e instanceof Error ? e.message : '格式错误的 URI 序列',
      },
    };
  }
}

export function buildQueryParams(params: Record<string, string>): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(JSON.stringify(params)).length;

  if (!params || Object.keys(params).length === 0) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '参数对象为空' },
    };
  }

  try {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value === '') {
        parts.push(encodeURIComponent(key));
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }

    const result = parts.join('&');
    const outputSize = new TextEncoder().encode(result).length;

    return {
      success: true,
      data: result,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'BUILD_ERROR',
        message: '查询字符串构建失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}
