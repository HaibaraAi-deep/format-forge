import type { Result } from '@/types';

export function formatJson(input: string, indent: number = 2): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Input JSON string is empty' },
    };
  }

  try {
    const parsed = JSON.parse(input);
    const indentStr = indent === -1 ? '\t' : indent;
    const formatted = JSON.stringify(parsed, null, indentStr);
    const outputSize = new TextEncoder().encode(formatted).length;

    return {
      success: true,
      data: formatted,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    const posMatch = msg.match(/position\s+(\d+)/i);
    let line: number | undefined;
    let column: number | undefined;

    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      const beforeError = input.substring(0, pos);
      const lines = beforeError.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Failed to format JSON',
        details: msg,
        line,
        column,
      },
    };
  }
}

export function minifyJson(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Input JSON string is empty' },
    };
  }

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    const outputSize = new TextEncoder().encode(minified).length;

    return {
      success: true,
      data: minified,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    const posMatch = msg.match(/position\s+(\d+)/i);
    let line: number | undefined;
    let column: number | undefined;

    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      const beforeError = input.substring(0, pos);
      const lines = beforeError.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Failed to minify JSON',
        details: msg,
        line,
        column,
      },
    };
  }
}

export function validateJson(
  input: string
): Result<{ valid: boolean; error?: string; line?: number; column?: number }> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: true,
      data: { valid: false, error: 'Input is empty' },
      meta: { processingTime: performance.now() - start, inputSize, outputSize: 0 },
    };
  }

  try {
    JSON.parse(input);
    const outputSize = new TextEncoder().encode('{"valid":true}').length;
    return {
      success: true,
      data: { valid: true },
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    const posMatch = msg.match(/position\s+(\d+)/i);
    let line: number | undefined;
    let column: number | undefined;

    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      const beforeError = input.substring(0, pos);
      const lines = beforeError.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    const outputSize = new TextEncoder().encode(JSON.stringify({ valid: false, error: msg, line, column })).length;

    return {
      success: true,
      data: { valid: false, error: msg, line, column },
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  }
}
