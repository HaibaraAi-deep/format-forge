import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { Copy, Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  value: string;
  label?: string;
  mimeType?: string;
  filename?: string;
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function OutputPanel({
  value,
  label = '输出',
  mimeType = 'text/plain',
  filename = 'output.txt',
}: OutputPanelProps) {
  const { copied, copy } = useClipboard();
  const byteSize = new TextEncoder().encode(value).length;

  const handleDownload = () => {
    const blob = new Blob([value], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(value)}
            disabled={!value}
            className="h-7 gap-1.5 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? '已复制' : '复制'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!value}
            className="h-7 gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            下载
          </Button>
        </div>
      </div>

      <Textarea
        value={value}
        readOnly
        placeholder="转换结果将在此显示..."
        className={cn(
          'min-h-[200px] font-mono text-sm resize-y bg-[var(--muted)]/30',
          'cursor-default',
        )}
      />

      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>{value.length} 字符</span>
        <span>{formatByteSize(byteSize)}</span>
      </div>
    </div>
  );
}
