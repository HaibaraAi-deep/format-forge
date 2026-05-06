import { useState, useCallback } from 'react';
import type { Result } from '@/types';

interface UseConverterOptions<T> {
  convertFn: (input: string) => Result<T>;
  autoConvert?: boolean;
  debounceMs?: number;
}

interface UseConverterReturn<T> {
  input: string;
  output: Result<T> | null;
  isConverting: boolean;
  error: string | null;
  setInput: (value: string) => void;
  convert: () => void;
  reset: () => void;
}

export function useConverter<T>({
  convertFn,
  autoConvert: _autoConvert = true,
}: UseConverterOptions<T>): UseConverterReturn<T> {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<Result<T> | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput(null);
      setError(null);
      return;
    }
    setIsConverting(true);
    setError(null);
    try {
      const result = convertFn(input);
      setOutput(result);
      if (!result.success) {
        setError(result.error.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setOutput(null);
    } finally {
      setIsConverting(false);
    }
  }, [input, convertFn]);

  const reset = useCallback(() => {
    setInput('');
    setOutput(null);
    setError(null);
  }, []);

  return {
    input,
    output,
    isConverting,
    error,
    setInput: (value: string) => {
      setInput(value);
    },
    convert,
    reset,
  };
}
