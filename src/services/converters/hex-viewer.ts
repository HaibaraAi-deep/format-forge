import type { Result } from '@/types';

export function bytesToHex(arrayBuffer: ArrayBuffer): Result<string> {
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
    const lines: string[] = [];

    for (let offset = 0; offset < bytes.length; offset += 16) {
      const hexParts: string[] = [];
      const asciiParts: string[] = [];

      for (let i = 0; i < 16; i++) {
        if (offset + i < bytes.length) {
          const byte = bytes[offset + i];
          hexParts.push(byte.toString(16).padStart(2, '0').toUpperCase());
          asciiParts.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
        } else {
          hexParts.push('  ');
          asciiParts.push(' ');
        }
      }

      const leftHex = hexParts.slice(0, 8).join(' ');
      const rightHex = hexParts.slice(8, 16).join(' ');
      const hexColumn = `${leftHex}  ${rightHex}`;
      const asciiColumn = asciiParts.join('');

      lines.push(
        `${offset.toString(16).padStart(8, '0').toUpperCase()}  ${hexColumn}  |${asciiColumn}|`
      );
    }

    const result = lines.join('\n');
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
        code: 'CONVERSION_ERROR',
        message: '字节转十六进制失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}

export function stringToHex(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入字符串为空' },
    };
  }

  try {
    const bytes = new TextEncoder().encode(input);
    const hexParts: string[] = [];

    for (let i = 0; i < bytes.length; i++) {
      hexParts.push(bytes[i].toString(16).padStart(2, '0').toUpperCase());
    }

    const result = hexParts.join(' ');
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
        code: 'CONVERSION_ERROR',
        message: '字符串转十六进制失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}
