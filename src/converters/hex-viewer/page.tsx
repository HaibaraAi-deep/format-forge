import { useState, useCallback } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { FileDropZone } from '@/components/converter/FileDropZone';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { useFileHandler } from '@/hooks/useFileHandler';
import { bytesToHex, stringToHex } from '@/services/converters/hex-viewer';
import { Copy, Check, FileCode, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'file-viewer' | 'text-to-hex';

const modes: { key: Mode; label: string; icon: typeof FileCode }[] = [
  { key: 'file-viewer', label: '文件查看', icon: FileCode },
  { key: 'text-to-hex', label: '文本转Hex', icon: Type },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HexViewerPage() {
  const [mode, setMode] = useState<Mode>('file-viewer');
  const [textInput, setTextInput] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ processingTime: number; inputSize: number; outputSize: number } | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const { copied, copy } = useClipboard();
  const { fileInfo, readAsArrayBuffer, clear } = useFileHandler();

  const handleFileLoad = useCallback(
    async (_content: string, file: File) => {
      try {
        const buffer = await readAsArrayBuffer(file);
        setFileSize(file.size);
        const result = bytesToHex(buffer);
        if (result.success) {
          setHexOutput(result.data);
          setError(null);
          setMeta(result.meta ?? null);
        } else {
          setHexOutput('');
          setError(result.error.message);
          setMeta(null);
        }
      } catch {
        setError('无法读取文件');
      }
    },
    [readAsArrayBuffer],
  );

  const handleTextConvert = useCallback(() => {
    if (!textInput.trim()) {
      setHexOutput('');
      setError(null);
      setMeta(null);
      return;
    }

    const result = stringToHex(textInput);
    if (result.success) {
      setHexOutput(result.data);
      setError(null);
      setMeta(result.meta ?? null);
    } else {
      setHexOutput('');
      setError(result.error.message);
      setMeta(null);
    }
  }, [textInput]);

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setTextInput('');
    setHexOutput('');
    setError(null);
    setMeta(null);
    setFileSize(0);
    clear();
  };

  return (
    <ConverterLayout
      title="Hex 查看器"
      description="查看二进制文件的十六进制内容，或将文本转换为十六进制表示"
    >
      <div className="flex items-center gap-1 rounded-[var(--radius)] bg-[var(--muted)] p-1">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => handleModeSwitch(m.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
                mode === m.key
                  ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {mode === 'file-viewer' ? (
        <div className="space-y-4">
          <FileDropZone onFileLoad={handleFileLoad} accept="*/*" />
          {fileInfo && (
            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <span>文件: {fileInfo.name}</span>
              <span>大小: {formatFileSize(fileSize)}</span>
              <span>类型: {fileInfo.type}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <InputPanel
            value={textInput}
            onChange={setTextInput}
            placeholder="在此输入要转换的文本..."
          />
          <div className="flex justify-end">
            <Button onClick={handleTextConvert} disabled={!textInput.trim()}>
              转换为 Hex
            </Button>
          </div>
        </div>
      )}

      {error && <ErrorDisplay error={error} />}

      {hexOutput && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--foreground)]">Hex 输出</label>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(hexOutput)}
                className="h-7 gap-1.5 text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
          </div>
          <pre className="max-h-[500px] overflow-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/30 p-4 font-mono text-xs leading-relaxed text-[var(--foreground)]">
            <code>{hexOutput}</code>
          </pre>
          {mode === 'file-viewer' && fileSize > 0 && (
            <div className="text-xs text-[var(--muted-foreground)]">
              文件大小: {formatFileSize(fileSize)}
            </div>
          )}
        </div>
      )}

      <ConversionStats
        processingTime={meta?.processingTime}
        inputSize={meta?.inputSize}
        outputSize={meta?.outputSize}
      />
    </ConverterLayout>
  );
}
