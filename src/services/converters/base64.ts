import type { Result } from '@/types';

export function encodeToBase64(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (input === '') {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Input string is empty' },
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
        message: 'Failed to encode input to Base64',
        details: e instanceof Error ? e.message : 'Unknown error',
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
      error: { code: 'EMPTY_INPUT', message: 'Input Base64 string is empty' },
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
        message: 'Failed to decode Base64 input',
        details: e instanceof Error ? e.message : 'Invalid Base64 string',
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
      error: { code: 'EMPTY_INPUT', message: 'Input ArrayBuffer is empty' },
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
        message: 'Failed to encode file to Base64',
        details: e instanceof Error ? e.message : 'Unknown error',
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
      error: { code: 'EMPTY_INPUT', message: 'Input Base64 string is empty' },
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
        message: 'Failed to decode Base64 to file',
        details: e instanceof Error ? e.message : 'Invalid Base64 string',
      },
    };
  }
}
