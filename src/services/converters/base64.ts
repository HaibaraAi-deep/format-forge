import type { Result } from '@/types';

export function encodeToBase64(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (input === '') {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入字符串为空' },
    };
  }

  try {
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const encoded = btoa(binary);
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
        message: 'Base64 编码失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}

export function decodeFromBase64(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 Base64 字符串为空' },
    };
  }

  try {
    const binary = atob(input.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
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
        message: 'Base64 解码失败',
        details: e instanceof Error ? e.message : '无效的 Base64 字符串',
      },
    };
  }
}

export function encodeFileToBase64(arrayBuffer: ArrayBuffer): Result<string> {
  const start = performance.now();
  const inputSize = arrayBuffer.byteLength;

  if (inputSize === 0) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入数据为空' },
    };
  }

  try {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const encoded = btoa(binary);
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
        message: '文件 Base64 编码失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}

export function decodeBase64ToFile(input: string): Result<{ data: ArrayBuffer; mimeType: string }> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 Base64 字符串为空' },
    };
  }

  try {
    let mimeType = 'application/octet-stream';
    let base64Data = input.trim();

    const dataUrlMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/s);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return {
      success: true,
      data: { data: bytes.buffer, mimeType },
      meta: {
        processingTime: performance.now() - start,
        inputSize,
        outputSize: bytes.byteLength,
      },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'DECODE_ERROR',
        message: 'Base64 文件解码失败',
        details: e instanceof Error ? e.message : '无效的 Base64 字符串',
      },
    };
  }
}
