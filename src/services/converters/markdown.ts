import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { Result } from '@/types';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function markdownToHtml(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Input Markdown string is empty' },
    };
  }

  try {
    const rawHtml = marked.parse(input) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    const outputSize = new TextEncoder().encode(cleanHtml).length;

    return {
      success: true,
      data: cleanHtml,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'MARKDOWN_PARSE_ERROR',
        message: 'Failed to convert Markdown to HTML',
        details: e instanceof Error ? e.message : 'Unknown error',
      },
    };
  }
}
