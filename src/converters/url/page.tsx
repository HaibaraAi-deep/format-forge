import { useState } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { OutputPanel } from '@/components/converter/OutputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import {
  encodeUrl,
  decodeUrl,
  parseQueryParams,
  buildQueryParams,
} from '@/services/converters/url';
import { cn } from '@/lib/utils';
import { Copy, Check, Plus, Trash2 } from 'lucide-react';

type Mode = 'encode' | 'decode' | 'parse' | 'build';

const modes: { key: Mode; label: string }[] = [
  { key: 'encode', label: 'URL 编码' },
  { key: 'decode', label: 'URL 解码' },
  { key: 'parse', label: '参数解析' },
  { key: 'build', label: '参数构建' },
];

export default function UrlPage() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedParams, setParsedParams] = useState<Record<string, string>>({});
  const [paramPairs, setParamPairs] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);
  const [stats, setStats] = useState<{
    processingTime?: number;
    inputSize?: number;
    outputSize?: number;
  }>({});

  const { copy } = useClipboard();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyParamValue = async (key: string, value: string) => {
    const success = await copy(value);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError(null);
    setParsedParams({});
    setStats({});
  };

  const handleConvert = () => {
    setError(null);
    setOutput('');
    setParsedParams({});

    if (mode === 'encode') {
      const result = encodeUrl(input);
      if (result.success) {
        setOutput(result.data);
        setStats(result.meta ?? {});
      } else {
        setError(result.error.details ?? result.error.message);
      }
    } else if (mode === 'decode') {
      const result = decodeUrl(input);
      if (result.success) {
        setOutput(result.data);
        setStats(result.meta ?? {});
      } else {
        setError(result.error.details ?? result.error.message);
      }
    } else if (mode === 'parse') {
      const result = parseQueryParams(input);
      if (result.success) {
        setParsedParams(result.data);
        setStats(result.meta ?? {});
      } else {
        setError(result.error.details ?? result.error.message);
      }
    }
  };

  const handleBuild = () => {
    setError(null);
    setOutput('');

    const params: Record<string, string> = {};
    for (const pair of paramPairs) {
      if (pair.key.trim()) {
        params[pair.key.trim()] = pair.value;
      }
    }

    const result = buildQueryParams(params);
    if (result.success) {
      setOutput(result.data);
      setStats(result.meta ?? {});
    } else {
      setError(result.error.details ?? result.error.message);
    }
  };

  const addParamPair = () => {
    setParamPairs([...paramPairs, { key: '', value: '' }]);
  };

  const removeParamPair = (index: number) => {
    setParamPairs(paramPairs.filter((_, i) => i !== index));
  };

  const updateParamPair = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...paramPairs];
    updated[index] = { ...updated[index], [field]: val };
    setParamPairs(updated);
  };

  return (
    <ConverterLayout
      title="URL 编码 / 解码"
      description="URL 编码解码、查询参数解析与构建"
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

      {(mode === 'encode' || mode === 'decode') && (
        <>
          <InputPanel
            value={input}
            onChange={setInput}
            placeholder={
              mode === 'encode'
                ? '在此输入需要编码的 URL 或文本...'
                : '在此输入需要解码的 URL 编码字符串...'
            }
          />
          <Button onClick={handleConvert} disabled={!input.trim()} className="w-full sm:w-auto">
            {mode === 'encode' ? '编码' : '解码'}
          </Button>
          {output && (
            <OutputPanel
              value={output}
              label={mode === 'encode' ? '编码结果' : '解码结果'}
              filename={mode === 'encode' ? 'encoded-url.txt' : 'decoded-url.txt'}
            />
          )}
        </>
      )}

      {mode === 'parse' && (
        <>
          <InputPanel
            value={input}
            onChange={setInput}
            placeholder="在此输入 URL 或查询字符串，例如：https://example.com?name=张三&age=25"
          />
          <Button onClick={handleConvert} disabled={!input.trim()} className="w-full sm:w-auto">
            解析参数
          </Button>
          {Object.keys(parsedParams).length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--foreground)]">解析结果</label>
              <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                      <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">
                        参数名
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">
                        参数值
                      </th>
                      <th className="px-3 py-2 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(parsedParams).map(([key, value]) => (
                      <tr key={key} className="border-b border-[var(--border)] last:border-b-0">
                        <td className="px-3 py-2 font-mono text-[var(--foreground)]">{key}</td>
                        <td className="px-3 py-2 font-mono text-[var(--foreground)]">
                          {value || <span className="text-[var(--muted-foreground)]">(空)</span>}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleCopyParamValue(key, value)}
                            className="inline-flex items-center justify-center rounded-[var(--radius)] p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
                          >
                            {copiedKey === key ? (
                              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'build' && (
        <>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-[var(--foreground)]">参数键值对</label>
            {paramPairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={pair.key}
                  onChange={(e) => updateParamPair(index, 'key', e.target.value)}
                  placeholder="参数名"
                  className="flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <span className="text-[var(--muted-foreground)]">=</span>
                <input
                  type="text"
                  value={pair.value}
                  onChange={(e) => updateParamPair(index, 'value', e.target.value)}
                  placeholder="参数值"
                  className="flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeParamPair(index)}
                  disabled={paramPairs.length <= 1}
                  className="h-8 w-8 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addParamPair} className="w-fit gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              添加参数
            </Button>
          </div>
          <Button
            onClick={handleBuild}
            disabled={!paramPairs.some((p) => p.key.trim())}
            className="w-full sm:w-auto"
          >
            构建查询字符串
          </Button>
          {output && (
            <OutputPanel
              value={output}
              label="查询字符串"
              filename="query-string.txt"
            />
          )}
        </>
      )}

      {error && <ErrorDisplay error={{ message: 'URL 转换错误', details: error }} />}

      <ConversionStats {...stats} />
    </ConverterLayout>
  );
}
