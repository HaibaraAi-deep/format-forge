import type { Result } from '@/types';

export function encodeUrl(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (input === '') {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Input string is empty' },
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
        message: 'Failed to URL-encode input',
        details: e instanceof Error ? e.message : 'Unknown error',
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
      error: { code: 'EMPTY_INPUT', message: 'Input URL-encoded string is empty' },
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
        message: 'Failed to URL-decode input',
        details: e instanceof Error ? e.message : 'Malformed URI sequence',
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
      error: { code: 'EMPTY_INPUT', message: 'Input query string is empty' },
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
        details: e instanceof Error ? e.message : 'Malformed URI sequence',
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
      error: { code: 'EMPTY_INPUT', message: 'Params object is empty' },
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
        message: 'Failed to build query string',
        details: e instanceof Error ? e.message : 'Unknown error',
      },
    };
  }
}
