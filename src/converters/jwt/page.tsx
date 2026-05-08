import { useState, useMemo } from 'react';
import type { Result } from '@/types';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { useDebounce } from '@/hooks/useDebounce';
import { parseJwt } from '@/services/converters/jwt';
import { Copy, Check, ShieldCheck, ShieldAlert } from 'lucide-react';

interface JwtDecoded {
  header: object;
  payload: object;
  signature: string;
  isExpired: boolean;
  expiresAt?: string;
}

function formatExpiry(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs <= 0) {
    const ago = Math.abs(diffMs);
    if (ago < 60_000) return `${Math.floor(ago / 1000)} 秒前过期`;
    if (ago < 3_600_000) return `${Math.floor(ago / 60_000)} 分钟前过期`;
    if (ago < 86_400_000) return `${Math.floor(ago / 3_600_000)} 小时前过期`;
    return `${Math.floor(ago / 86_400_000)} 天前过期`;
  }

  if (diffMs < 60_000) return `${Math.floor(diffMs / 1000)} 秒后过期`;
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} 分钟后过期`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)} 小时后过期`;
  return `${Math.floor(diffMs / 86_400_000)} 天后过期`;
}

function JsonBlock({ json, title, copyButton }: { json: string; title: string; copyButton?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--foreground)]">{title}</span>
        {copyButton}
      </div>
      <pre className="overflow-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/30 p-4 font-mono text-xs leading-relaxed">
        <code>{syntaxHighlightElements(json)}</code>
      </pre>
    </div>
  );
}

function syntaxHighlightElements(json: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(json)) !== null) {
    if (match.index > lastIndex) {
      parts.push(json.slice(lastIndex, match.index));
    }
    let cls = 'text-[#e06c75]';
    if (/^"/.test(match[0])) {
      if (/:$/.test(match[0])) {
        cls = 'text-[#61afef]';
      } else {
        cls = 'text-[#98c379]';
      }
    } else if (/true|false/.test(match[0])) {
      cls = 'text-[#d19a66]';
    } else if (/null/.test(match[0])) {
      cls = 'text-[#c678dd]';
    } else if (/\d/.test(match[0])) {
      cls = 'text-[#d19a66]';
    }
    parts.push(<span key={key++} className={cls}>{match[0]}</span>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < json.length) {
    parts.push(json.slice(lastIndex));
  }

  return parts;
}

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useClipboard();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copy(text)}
      className="h-7 gap-1.5 text-xs"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[var(--success)]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? '已复制' : '复制'}
    </Button>
  );
}

export default function JwtPage() {
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 300);

  const conversionResult = useMemo(() => {
    if (!debouncedInput.trim()) {
      return { decoded: null as JwtDecoded | null, error: null as string | null };
    }

    const result: Result<JwtDecoded> = parseJwt(debouncedInput);
    if (result.success) {
      return { decoded: result.data, error: null };
    }
    return { decoded: null, error: result.error.message };
  }, [debouncedInput]);

  const decoded = conversionResult.decoded;
  const error = conversionResult.error;

  const headerJson = decoded ? JSON.stringify(decoded.header, null, 2) : '';
  const payloadJson = decoded ? JSON.stringify(decoded.payload, null, 2) : '';

  return (
    <ConverterLayout
      title="JWT 解析器"
      description="解析和查看 JWT Token 的 Header、Payload 和 Signature 内容"
    >
      <InputPanel
        value={input}
        onChange={setInput}
        placeholder="在此粘贴 JWT Token（格式: xxxxx.yyyyy.zzzzz）..."
      />

      {error && <ErrorDisplay error={error} />}

      {decoded && (
        <div className="space-y-4">
          {decoded.expiresAt && (
            <div className="flex items-center gap-2">
              {decoded.isExpired ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--destructive)]/10 px-3 py-1 text-xs font-medium text-[var(--destructive)]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  已过期
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  有效
                </span>
              )}
              <span className="text-xs text-[var(--muted-foreground)]">
                {formatExpiry(decoded.expiresAt)}（{new Date(decoded.expiresAt).toLocaleString()}）
              </span>
            </div>
          )}

          <JsonBlock
            title="Header"
            json={headerJson}
            copyButton={<CopyButton text={headerJson} />}
          />

          <JsonBlock
            title="Payload"
            json={payloadJson}
            copyButton={<CopyButton text={payloadJson} />}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Signature</span>
            <div className="overflow-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/30 p-4 font-mono text-xs break-all text-[var(--muted-foreground)]">
              {decoded.signature}
            </div>
          </div>
        </div>
      )}
    </ConverterLayout>
  );
}
