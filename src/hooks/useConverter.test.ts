import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConverter } from '@/hooks/useConverter';
import { formatJson } from '@/services/converters/json-formatter';

describe('useConverter', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() =>
      useConverter({ convertFn: formatJson })
    );

    expect(result.current.input).toBe('');
    expect(result.current.output).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isConverting).toBe(false);
  });

  it('should convert valid input', () => {
    const { result } = renderHook(() =>
      useConverter({ convertFn: formatJson })
    );

    act(() => {
      result.current.setInput('{"a":1}');
    });

    act(() => {
      result.current.convert();
    });

    expect(result.current.output).not.toBeNull();
    expect(result.current.output?.success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle conversion errors', () => {
    const { result } = renderHook(() =>
      useConverter({ convertFn: formatJson })
    );

    act(() => {
      result.current.setInput('{invalid}');
    });

    act(() => {
      result.current.convert();
    });

    expect(result.current.error).not.toBeNull();
  });

  it('should not convert empty input', () => {
    const { result } = renderHook(() =>
      useConverter({ convertFn: formatJson })
    );

    act(() => {
      result.current.convert();
    });

    expect(result.current.output).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should reset state', () => {
    const { result } = renderHook(() =>
      useConverter({ convertFn: formatJson })
    );

    act(() => {
      result.current.setInput('{"a":1}');
      result.current.convert();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.input).toBe('');
    expect(result.current.output).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
