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
      error: { code: 'EMPTY_INPUT', message: '输入的 Markdown 字符串为空' },
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
        message: 'Markdown 转 HTML 失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}
