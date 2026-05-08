import Papa from 'papaparse';
import type { Result } from '@/types';

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

export function jsonToCsv(
  json: string,
  options?: { delimiter?: string; flatten?: boolean; includeHeaders?: boolean }
): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(json).length;

  if (!json || !json.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 JSON 字符串为空' },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '无效的 JSON';
    return {
      success: false,
      error: { code: 'INVALID_JSON', message: 'JSON 解析失败', details: msg },
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      success: false,
      error: { code: 'NON_ARRAY_JSON', message: 'JSON 必须是对象数组才能转换为 CSV' },
    };
  }

  if (parsed.length === 0) {
    return {
      success: false,
      error: { code: 'EMPTY_ARRAY', message: 'JSON 数组为空，无法转换' },
    };
  }

  const shouldFlatten = options?.flatten ?? true;
  const includeHeaders = options?.includeHeaders ?? true;
  const delimiter = options?.delimiter ?? ',';

  const data = shouldFlatten
    ? parsed.map((item) =>
        typeof item === 'object' && item !== null && !Array.isArray(item)
          ? flattenObject(item as Record<string, unknown>)
          : { value: item }
      )
    : parsed;

  const result = Papa.unparse(data as Record<string, unknown>[], {
    delimiter,
    header: includeHeaders,
  });

  const outputSize = new TextEncoder().encode(result).length;

  return {
    success: true,
    data: result,
    meta: {
      processingTime: performance.now() - start,
      inputSize,
      outputSize,
    },
  };
}

export function csvToJson(
  csv: string,
  options?: { delimiter?: string; dynamicTyping?: boolean }
): Result<object[]> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(csv).length;

  if (!csv || !csv.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 CSV 字符串为空' },
    };
  }

  const result = Papa.parse(csv, {
    delimiter: options?.delimiter ?? '',
    dynamicTyping: options?.dynamicTyping ?? true,
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    return {
      success: false,
      error: {
        code: 'CSV_PARSE_ERROR',
        message: firstError.message,
        ...(firstError.row !== undefined && { line: firstError.row + 1 }),
      },
    };
  }

  const outputSize = new TextEncoder().encode(JSON.stringify(result.data)).length;

  return {
    success: true,
    data: result.data as object[],
    meta: {
      processingTime: performance.now() - start,
      inputSize,
      outputSize,
    },
  };
}
