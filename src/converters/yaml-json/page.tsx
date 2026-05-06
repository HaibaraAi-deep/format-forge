import { useState, useCallback } from 'react';
import type { Result } from '@/types';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { OutputPanel } from '@/components/converter/OutputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { yamlToJson, jsonToYaml } from '@/services/converters/yaml-json';
import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'yaml-to-json' | 'json-to-yaml';

const modes: { key: Mode; label: string }[] = [
  { key: 'yaml-to-json', label: 'YAML → JSON' },
  { key: 'json-to-yaml', label: 'JSON → YAML' },
];

export default function YamlJsonPage() {
  const [mode, setMode] = useState<Mode>('yaml-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ processingTime: number; inputSize: number; outputSize: number } | null>(null);

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      setMeta(null);
      return;
    }

    const fn: (input: string) => Result<string> = mode === 'yaml-to-json' ? yamlToJson : jsonToYaml;
    const result = fn(input);

    if (result.success) {
      setOutput(result.data);
      setError(null);
      setMeta(result.meta ?? null);
    } else {
      setOutput('');
      setError(result.error.message);
      setMeta(null);
    }
  }, [input, mode]);

  const handleModeSwitch = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setInput(output);
    setOutput(input);
    setError(null);
    setMeta(null);
  };

  const inputPlaceholder = mode === 'yaml-to-json' ? '在此输入 YAML 内容...' : '在此输入 JSON 内容...';
  const outputLabel = mode === 'yaml-to-json' ? 'JSON 输出' : 'YAML 输出';
  const outputFilename = mode === 'yaml-to-json' ? 'output.json' : 'output.yaml';
  const outputMimeType = mode === 'yaml-to-json' ? 'application/json' : 'text/yaml';

  return (
    <ConverterLayout
      title="YAML ↔ JSON 转换器"
      description="在 YAML 和 JSON 格式之间互相转换，支持实时解析与错误提示"
    >
      <div className="flex items-center gap-1 rounded-[var(--radius)] bg-[var(--muted)] p-1">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => handleModeSwitch(m.key)}
            className={cn(
              'flex-1 rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
              mode === m.key
                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputPanel
          value={input}
          onChange={setInput}
          placeholder={inputPlaceholder}
          acceptFileTypes=".yaml,.yml,.json"
        />
        <OutputPanel
          value={output}
          label={outputLabel}
          filename={outputFilename}
          mimeType={outputMimeType}
        />
      </div>

      {error && <ErrorDisplay error={error} />}

      <div className="flex items-center justify-between">
        <ConversionStats
          processingTime={meta?.processingTime}
          inputSize={meta?.inputSize}
          outputSize={meta?.outputSize}
        />
        <Button onClick={convert} disabled={!input.trim()}>
          <ArrowRightLeft className="h-4 w-4" />
          转换
        </Button>
      </div>
    </ConverterLayout>
  );
}
