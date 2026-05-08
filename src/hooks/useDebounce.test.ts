import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 100 } }
    );

    expect(result.current).toBe('hello');

    rerender({ value: 'world', delay: 100 });
    expect(result.current).toBe('hello');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    expect(result.current).toBe('world');
  });

  it('should reset timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 100 } }
    );

    rerender({ value: 'b', delay: 100 });
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    rerender({ value: 'c', delay: 100 });
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    expect(result.current).toBe('a');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current).toBe('c');
  });
});
