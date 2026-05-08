import { useState, useEffect } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import {
  timestampToDate,
  dateToTimestamp,
  getCurrentTimestamp,
} from '@/services/converters/timestamp';
import { cn } from '@/lib/utils';
import { Copy, Check, ArrowRightLeft, Clock } from 'lucide-react';

type Direction = 'ts2date' | 'date2ts';

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let relative;
  if (years > 0) relative = `${years} 年`;
  else if (months > 0) relative = `${months} 个月`;
  else if (days > 0) relative = `${days} 天`;
  else if (hours > 0) relative = `${hours} 小时`;
  else if (minutes > 0) relative = `${minutes} 分钟`;
  else relative = `${seconds} 秒`;

  return isFuture ? `${relative}后` : `${relative}前`;
}

function detectTimestampUnit(ts: number): 'seconds' | 'milliseconds' {
  return Math.abs(ts) < 1e12 ? 'seconds' : 'milliseconds';
}

export default function TimestampPage() {
  const [direction, setDirection] = useState<Direction>('ts2date');
  const [timestampInput, setTimestampInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    processingTime?: number;
    inputSize?: number;
    outputSize?: number;
  }>({});

  const [ts2dateResults, setTs2dateResults] = useState<{
    iso: string;
    local: string;
    relative: string;
    unit: 'seconds' | 'milliseconds';
  } | null>(null);

  const [date2tsResults, setDate2tsResults] = useState<{
    seconds: number;
    milliseconds: number;
  } | null>(null);

  const [currentTs, setCurrentTs] = useState(getCurrentTimestamp());

  const { copy } = useClipboard();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTs(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyField = async (field: string, value: string) => {
    const success = await copy(value);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleConvert = () => {
    setError(null);
    setTs2dateResults(null);
    setDate2tsResults(null);
    setStats({});

    if (direction === 'ts2date') {
      const ts = Number(timestampInput);
      if (isNaN(ts)) {
        setError('请输入有效的数字时间戳');
        return;
      }
      const result = timestampToDate(ts);
      if (result.success) {
        const date = new Date(result.data);
        const unit = detectTimestampUnit(ts);
        setTs2dateResults({
          iso: date.toISOString(),
          local: date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
          relative: getRelativeTime(date),
          unit,
        });
        setStats(result.meta ?? {});
      } else {
        setError(result.error.details ?? result.error.message);
      }
    } else {
      if (!dateInput) {
        setError('请选择或输入日期时间');
        return;
      }
      const result = dateToTimestamp(dateInput);
      if (result.success) {
        setDate2tsResults({
          seconds: result.data,
          milliseconds: result.data * 1000,
        });
        setStats(result.meta ?? {});
      } else {
        setError(result.error.details ?? result.error.message);
      }
    }
  };

  const handleDirectionToggle = () => {
    const newDir = direction === 'ts2date' ? 'date2ts' : 'ts2date';
    setDirection(newDir);
    setError(null);
    setTs2dateResults(null);
    setDate2tsResults(null);
    setStats({});
  };

  return (
    <ConverterLayout
      title="时间戳转换"
      description="Unix 时间戳与日期互转，支持秒级和毫秒级时间戳"
    >
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">当前时间戳</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
            <span className="text-xs text-[var(--muted-foreground)]">秒</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm text-[var(--foreground)]">{currentTs.unix}</span>
              <button
                onClick={() => handleCopyField('current-seconds', String(currentTs.unix))}
                className="inline-flex items-center justify-center rounded-[var(--radius)] p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {copiedField === 'current-seconds' ? (
                  <Check className="h-3 w-3 text-[var(--success)]" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
            <span className="text-xs text-[var(--muted-foreground)]">毫秒</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm text-[var(--foreground)]">{currentTs.unix * 1000}</span>
              <button
                onClick={() => handleCopyField('current-ms', String(currentTs.unix * 1000))}
                className="inline-flex items-center justify-center rounded-[var(--radius)] p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {copiedField === 'current-ms' ? (
                  <Check className="h-3 w-3 text-[var(--success)]" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
            <span className="text-xs text-[var(--muted-foreground)]">本地时间</span>
            <span className="font-mono text-sm text-[var(--foreground)]">{currentTs.local}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDirectionToggle}
          className={cn(
            'flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors',
            'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
          )}
        >
          <ArrowRightLeft className="h-4 w-4" />
          {direction === 'ts2date' ? '时间戳 → 日期' : '日期 → 时间戳'}
        </button>
      </div>

      {direction === 'ts2date' ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--foreground)]">输入时间戳</label>
            <input
              type="text"
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              placeholder="例如：1700000000 或 1700000000000"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            {timestampInput && !isNaN(Number(timestampInput)) && (
              <span className="text-xs text-[var(--muted-foreground)]">
                检测为{detectTimestampUnit(Number(timestampInput)) === 'seconds' ? '秒级' : '毫秒级'}时间戳
              </span>
            )}
          </div>
          <Button onClick={handleConvert} disabled={!timestampInput.trim()} className="w-full sm:w-auto">
            转换为日期
          </Button>
          {ts2dateResults && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--foreground)]">转换结果</label>
              <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/10 p-3">
                <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--muted-foreground)]">ISO 8601</span>
                    <span className="font-mono text-sm text-[var(--foreground)]">{ts2dateResults.iso}</span>
                  </div>
                  <button
                    onClick={() => handleCopyField('iso', ts2dateResults.iso)}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                  >
                    {copiedField === 'iso' ? (
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--muted-foreground)]">本地时间</span>
                    <span className="font-mono text-sm text-[var(--foreground)]">{ts2dateResults.local}</span>
                  </div>
                  <button
                    onClick={() => handleCopyField('local', ts2dateResults.local)}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                  >
                    {copiedField === 'local' ? (
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--muted-foreground)]">相对时间</span>
                    <span className="font-mono text-sm text-[var(--foreground)]">{ts2dateResults.relative}</span>
                  </div>
                  <button
                    onClick={() => handleCopyField('relative', ts2dateResults.relative)}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                  >
                    {copiedField === 'relative' ? (
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--foreground)]">输入日期时间</label>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <Button onClick={handleConvert} disabled={!dateInput.trim()} className="w-full sm:w-auto">
            转换为时间戳
          </Button>
          {date2tsResults && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--foreground)]">转换结果</label>
              <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/10 p-3">
                <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--muted-foreground)]">Unix 时间戳（秒）</span>
                    <span className="font-mono text-sm text-[var(--foreground)]">{date2tsResults.seconds}</span>
                  </div>
                  <button
                    onClick={() => handleCopyField('ts-seconds', String(date2tsResults.seconds))}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                  >
                    {copiedField === 'ts-seconds' ? (
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--muted-foreground)]">Unix 时间戳（毫秒）</span>
                    <span className="font-mono text-sm text-[var(--foreground)]">{date2tsResults.milliseconds}</span>
                  </div>
                  <button
                    onClick={() => handleCopyField('ts-ms', String(date2tsResults.milliseconds))}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                  >
                    {copiedField === 'ts-ms' ? (
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {error && <ErrorDisplay error={{ message: '时间戳转换错误', details: error }} />}

      <ConversionStats {...stats} />

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/10 p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--foreground)]">常见日期格式示例</h3>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
            <span className="text-[var(--muted-foreground)]">ISO 8601</span>
            <p className="font-mono text-[var(--foreground)]">2024-01-15T08:30:00.000Z</p>
          </div>
          <div className="rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
            <span className="text-[var(--muted-foreground)]">RFC 2822</span>
            <p className="font-mono text-[var(--foreground)]">Mon, 15 Jan 2024 08:30:00 GMT</p>
          </div>
          <div className="rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
            <span className="text-[var(--muted-foreground)]">Unix 秒</span>
            <p className="font-mono text-[var(--foreground)]">1705302600</p>
          </div>
          <div className="rounded-[var(--radius)] bg-[var(--muted)]/30 px-3 py-2">
            <span className="text-[var(--muted-foreground)]">Unix 毫秒</span>
            <p className="font-mono text-[var(--foreground)]">1705302600000</p>
          </div>
        </div>
      </div>
    </ConverterLayout>
  );
}
