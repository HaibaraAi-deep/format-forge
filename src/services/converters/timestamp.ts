import type { Result } from '@/types';

export function timestampToDate(timestamp: number): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(String(timestamp)).length;

  if (timestamp === undefined || timestamp === null || isNaN(timestamp)) {
    return {
      success: false,
      error: { code: 'INVALID_TIMESTAMP', message: 'Invalid timestamp value' },
    };
  }

  try {
    let ts = timestamp;

    if (Math.abs(ts) < 1e12) {
      ts = ts * 1000;
    }

    const date = new Date(ts);

    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: { code: 'INVALID_TIMESTAMP', message: 'Timestamp results in invalid date' },
      };
    }

    const isoString = date.toISOString();
    const outputSize = new TextEncoder().encode(isoString).length;

    return {
      success: true,
      data: isoString,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert timestamp to date',
        details: e instanceof Error ? e.message : 'Unknown error',
      },
    };
  }
}

export function dateToTimestamp(dateStr: string): Result<number> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(dateStr).length;

  if (!dateStr || !dateStr.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Date string is empty' },
    };
  }

  try {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: { code: 'INVALID_DATE', message: 'Invalid date string', details: dateStr },
      };
    }

    const unixTimestamp = Math.floor(date.getTime() / 1000);
    const outputSize = new TextEncoder().encode(String(unixTimestamp)).length;

    return {
      success: true,
      data: unixTimestamp,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert date to timestamp',
        details: e instanceof Error ? e.message : 'Unknown error',
      },
    };
  }
}

export function getCurrentTimestamp(): { unix: number; iso: string; local: string } {
  const now = new Date();
  return {
    unix: Math.floor(now.getTime() / 1000),
    iso: now.toISOString(),
    local: now.toLocaleString(),
  };
}
