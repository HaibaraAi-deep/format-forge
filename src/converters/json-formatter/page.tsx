import { useState } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { OutputPanel } from '@/components/converter/OutputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { formatJson, minifyJson, validateJson } from '@/services/converters/json-formatter';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

type Mode = 'format' | 'minify' | 'validate';
type Indent = 2 | 4 | -1;

const modes: { key: Mode; label: string }[] = [
  { key: 'format', label: '格式化' },
  { key: 'minify', label: '压缩' },
  { key: 'validate', label: '校验' },
];

const indentOptions: { value: Indent; label: string }[] = [
  { value: 2, label: '2 空格' },
  { value: 4, label: '4 空格' },
  { value: -1, label: 'Tab' },
];

export default function JsonFormatterPage() {
  const [mode, setMode] = useState<Mode>('format');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<Indent>(2);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
    line?: number;
    column?: number;
  } | null>(null);
  const [stats, setStats] = useState<{
    processingTime?: number;
    inputSize?: number;
    outputSize?: number;
  }>({});

  const handleConvert = () => {
    setError(null);
    setValidationResult(null);
    setOutput('');

    if (mode === 'format') {
      const result = formatJson(input, indent);
      if (result.success) {
        setOutput(result.data);
        setStats(result.meta ?? {});
      } else {
        setError(result.error.details ?? result.error.message);
      }
    } else if (mode === 'minify') {
      const result = minifyJson(input);
      if (result.success) {
        setOutput(result.data);
        setStats(result.meta ?? {});
      } else {
        setError(result.error.details ?? result.error.message);
      }
    } else {
      const result = validateJson(input);
      if (result.success) {
        setValidationResult(result.data);
        setStats(result.meta ?? {});
        if (result.data.valid) {
          setOutput('JSON 格式正确 ✓');
        }
      } else {
        setError(result.error.details ?? result.error.message);
      }
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setOutput('');
    setError(null);
    setValidationResult(null);
    setStats({});
  };

  return (
    <ConverterLayout
      title="JSON 格式化 / 压缩 / 校验"
      description="格式化、压缩或校验 JSON 数据，支持自定义缩进，错误定位到行/列"
    >
      <div className="flex flex-wrap gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/30 p-1">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => handleModeChange(m.key)}
            className={cn(
              'rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
              mode === m.key
                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'format' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted-foreground)]">缩进：</span>
          <div className="flex gap-1">
            {indentOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={indent === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIndent(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <InputPanel
        value={input}
        onChange={setInput}
        placeholder='在此输入 JSON，例如：{"name": "FormatForge", "version": 1}'
        acceptFileTypes=".json"
      />

      <Button onClick={handleConvert} disabled={!input.trim()} className="w-full sm:w-auto">
        {mode === 'format' ? '格式化' : mode === 'minify' ? '压缩' : '校验'}
      </Button>

      {error && (
        <ErrorDisplay
          error={{
            message: 'JSON 解析错误',
            details: error,
          }}
        />
      )}

      {mode === 'validate' && validationResult && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-[var(--radius)] border p-4',
            validationResult.valid
              ? 'border-[var(--success)]/30 bg-[var(--success)]/5'
              : 'border-[var(--destructive)]/30 bg-[var(--destructive)]/5',
          )}
        >
          {validationResult.valid ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--destructive)]" />
          )}
          <div className="flex flex-col gap-1">
            <p
              className={cn(
                'text-sm font-medium',
                validationResult.valid ? 'text-[var(--success)]' : 'text-[var(--destructive)]',
              )}
            >
              {validationResult.valid ? 'JSON 格式正确 ✓' : 'JSON 格式错误'}
            </p>
            {!validationResult.valid && validationResult.error && (
              <p className="text-xs text-[var(--destructive)]/70">{validationResult.error}</p>
            )}
            {!validationResult.valid && validationResult.line && (
              <p className="text-xs text-[var(--destructive)]/70">
                位置：第 {validationResult.line} 行，第 {validationResult.column} 列
              </p>
            )}
          </div>
        </div>
      )}

      {mode !== 'validate' && output && (
        <OutputPanel
          value={output}
          label={mode === 'format' ? '格式化结果' : '压缩结果'}
          filename={mode === 'format' ? 'formatted.json' : 'minified.json'}
          mimeType="application/json"
        />
      )}

      <ConversionStats {...stats} />
    </ConverterLayout>
  );
}
