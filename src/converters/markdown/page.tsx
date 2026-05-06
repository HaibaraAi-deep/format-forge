import { useState, useEffect } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import { useDebounce } from '@/hooks/useDebounce';
import { markdownToHtml } from '@/services/converters/markdown';
import { cn } from '@/lib/utils';
import { Copy, Check, Download } from 'lucide-react';

type OutputTab = 'preview' | 'source';

const defaultMarkdown = `# FormatForge

一个强大的**在线格式转换工具**，支持多种数据格式转换。

## 功能特性

- JSON 格式化与压缩
- Markdown 转 HTML
- URL 编码与解码
- 时间戳转换

## 代码示例

\`\`\`javascript
const result = formatJson(input, 2);
console.log(result);
\`\`\`

## 表格

| 格式 | 输入 | 输出 |
|------|------|------|
| JSON | 压缩 | 格式化 |
| Markdown | .md | HTML |

> 所有数据在浏览器本地处理，绝不上传服务器。

---

更多功能正在开发中，敬请期待！
`;

export default function MarkdownPage() {
  const [input, setInput] = useState(defaultMarkdown);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<OutputTab>('preview');
  const [stats, setStats] = useState<{
    processingTime?: number;
    inputSize?: number;
    outputSize?: number;
  }>({});

  const { copied, copy } = useClipboard();
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setHtmlOutput('');
      setStats({});
      return;
    }

    const result = markdownToHtml(debouncedInput);
    if (result.success) {
      setHtmlOutput(result.data);
      setError(null);
      setStats(result.meta ?? {});
    } else {
      setHtmlOutput('');
      setError(result.error.details ?? result.error.message);
      setStats({});
    }
  }, [debouncedInput]);

  const handleDownload = () => {
    if (!htmlOutput) return;
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
  </style>
</head>
<body>
${htmlOutput}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ConverterLayout
      title="Markdown 转 HTML"
      description="实时将 Markdown 转换为 HTML，支持预览和源码查看"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel
          value={input}
          onChange={setInput}
          placeholder="在此输入 Markdown 内容..."
          acceptFileTypes=".md,.markdown,.txt"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/30 p-1">
              <button
                onClick={() => setOutputTab('preview')}
                className={cn(
                  'rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
                  outputTab === 'preview'
                    ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                )}
              >
                预览
              </button>
              <button
                onClick={() => setOutputTab('source')}
                className={cn(
                  'rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
                  outputTab === 'source'
                    ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                )}
              >
                HTML 源码
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(htmlOutput)}
                disabled={!htmlOutput}
                className="h-7 gap-1.5 text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? '已复制' : '复制 HTML'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={!htmlOutput}
                className="h-7 gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                下载 .html
              </Button>
            </div>
          </div>

          {outputTab === 'preview' ? (
            <div
              className={cn(
                'min-h-[200px] flex-1 overflow-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-4',
                'prose prose-sm dark:prose-invert max-w-none',
                'text-sm leading-relaxed text-[var(--foreground)]',
              )}
              dangerouslySetInnerHTML={{ __html: htmlOutput || '<p class="text-[var(--muted-foreground)]">预览将在此显示...</p>' }}
            />
          ) : (
            <textarea
              value={htmlOutput}
              readOnly
              placeholder="HTML 源码将在此显示..."
              className="min-h-[200px] flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/30 p-3 font-mono text-sm resize-y text-[var(--foreground)]"
            />
          )}
        </div>
      </div>

      {error && <ErrorDisplay error={{ message: 'Markdown 转换错误', details: error }} />}

      <ConversionStats {...stats} />
    </ConverterLayout>
  );
}
