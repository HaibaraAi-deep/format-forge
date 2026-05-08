import type { Result } from '@/types';

export function timestampToDate(timestamp: number): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(String(timestamp)).length;

  if (timestamp === undefined || timestamp === null || isNaN(timestamp)) {
    return {
      success: false,
      error: { code: 'INVALID_TIMESTAMP', message: '无效的时间戳值' },
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
        error: { code: 'INVALID_TIMESTAMP', message: '时间戳对应无效日期' },
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
        message: '时间戳转日期失败',
        details: e instanceof Error ? e.message : '未知错误',
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
      error: { code: 'EMPTY_INPUT', message: '日期字符串为空' },
    };
  }

  try {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: { code: 'INVALID_DATE', message: '无效的日期字符串', details: dateStr },
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
        message: '日期转时间戳失败',
        details: e instanceof Error ? e.message : '未知错误',
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
