import { useState, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { OutputPanel } from '@/components/converter/OutputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { jsonToCsv, csvToJson } from '@/services/converters/json-csv';
import { useDebounce } from '@/hooks/useDebounce';
import { ArrowRightLeft, FileSpreadsheet, Braces } from 'lucide-react';

type Mode = 'json-to-csv' | 'csv-to-json';
type DelimiterOption = 'comma' | 'tab' | 'semicolon' | 'custom';

const DELIMITER_MAP: Record<DelimiterOption, string> = {
  comma: ',',
  tab: '\t',
  semicolon: ';',
  custom: '',
};

export default function JsonCsvPage() {
  const [mode, setMode] = useState<Mode>('json-to-csv');
  const [input, setInput] = useState('');
  const [delimiterOption, setDelimiterOption] = useState<DelimiterOption>('comma');
  const [customDelimiter, setCustomDelimiter] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [flatten, setFlatten] = useState(true);

  const debouncedInput = useDebounce(input, 300);

  const conversionResult = useMemo(() => {
    if (!input.trim() || !debouncedInput.trim()) {
      return { output: '', error: null as string | null, stats: {} as { processingTime?: number; inputSize?: number; outputSize?: number } };
    }

    const delimiter = delimiterOption === 'custom' ? (customDelimiter || ',') : DELIMITER_MAP[delimiterOption];
    if (mode === 'json-to-csv') {
      const r = jsonToCsv(debouncedInput, { delimiter, flatten, includeHeaders });
      if (r.success) {
        return {
          output: r.data,
          error: null as string | null,
          stats: {
            processingTime: r.meta?.processingTime,
            inputSize: r.meta?.inputSize,
            outputSize: r.meta?.outputSize,
          },
        };
      }
      return { output: '', error: r.error.message, stats: {} as { processingTime?: number; inputSize?: number; outputSize?: number } };
    }
    const r = csvToJson(debouncedInput, { delimiter });
    if (r.success) {
      return {
        output: JSON.stringify(r.data, null, 2),
        error: null as string | null,
        stats: {
          processingTime: r.meta?.processingTime,
          inputSize: r.meta?.inputSize,
          outputSize: r.meta?.outputSize,
        },
      };
    }
    return { output: '', error: r.error.message, stats: {} as { processingTime?: number; inputSize?: number; outputSize?: number } };
  }, [input, debouncedInput, mode, delimiterOption, customDelimiter, flatten, includeHeaders]);

  const output = conversionResult.output;
  const error = conversionResult.error;
  const stats = conversionResult.stats;

  const handleModeSwitch = () => {
    setMode((prev) => (prev === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv'));
    setInput('');
  };

  const handleFileLoad = (content: string) => {
    setInput(content);
  };

  return (
    <ConverterLayout
      title="JSON ↔ CSV 转换器"
      description="在 JSON 和 CSV 格式之间自由转换，支持自定义分隔符、嵌套对象展开等选项"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => mode !== 'json-to-csv' && handleModeSwitch()}
          className={`flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'json-to-csv'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80'
          }`}
        >
          <Braces className="h-4 w-4" />
          JSON → CSV
        </button>
        <button
          onClick={() => mode !== 'csv-to-json' && handleModeSwitch()}
          className={`flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'csv-to-json'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          CSV → JSON
        </button>
        <Button variant="ghost" size="sm" onClick={handleModeSwitch} className="ml-auto">
          <ArrowRightLeft className="h-4 w-4" />
          切换
        </Button>
      </div>

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--foreground)]">分隔符</label>
            <select
              value={delimiterOption}
              onChange={(e) => setDelimiterOption(e.target.value as DelimiterOption)}
              className="h-8 rounded-[var(--radius)] border border-[var(--input)] bg-transparent px-2 text-sm text-[var(--foreground)]"
            >
              <option value="comma">逗号 (,)</option>
              <option value="tab">制表符 (Tab)</option>
              <option value="semicolon">分号 (;)</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          {delimiterOption === 'custom' && (
            <input
              type="text"
              value={customDelimiter}
              onChange={(e) => setCustomDelimiter(e.target.value)}
              placeholder="输入自定义分隔符"
              className="h-8 w-32 rounded-[var(--radius)] border border-[var(--input)] bg-transparent px-2 text-sm text-[var(--foreground)]"
            />
          )}

          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="rounded"
            />
            包含表头
          </label>

          {mode === 'json-to-csv' && (
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                className="rounded"
              />
              展开嵌套对象
            </label>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel
          value={input}
          onChange={setInput}
          placeholder={mode === 'json-to-csv' ? '在此输入 JSON 数组...' : '在此输入 CSV 数据...'}
          acceptFileTypes={mode === 'json-to-csv' ? '.json' : '.csv,.tsv,.txt'}
          onFileLoad={handleFileLoad}
        />
        <OutputPanel
          value={output}
          label={mode === 'json-to-csv' ? 'CSV 输出' : 'JSON 输出'}
          filename={mode === 'json-to-csv' ? 'output.csv' : 'output.json'}
          mimeType={mode === 'json-to-csv' ? 'text/csv' : 'application/json'}
        />
      </div>

      {error && <ErrorDisplay error={error} />}

      <ConversionStats
        processingTime={stats.processingTime}
        inputSize={stats.inputSize}
        outputSize={stats.outputSize}
      />
    </ConverterLayout>
  );
}
