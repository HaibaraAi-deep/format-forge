import { useState, useEffect, useCallback, useRef } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { OutputPanel } from '@/components/converter/OutputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { encodeToBase64, decodeFromBase64, encodeFileToBase64, decodeBase64ToFile } from '@/services/converters/base64';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { ArrowRightLeft, Lock, Unlock, Download, FileUp } from 'lucide-react';

type Mode = 'encode' | 'decode';

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ processingTime?: number; inputSize?: number; outputSize?: number }>({});
  const [isDataUrl, setIsDataUrl] = useState(false);
  const [decodedFileInfo, setDecodedFileInfo] = useState<{ mimeType: string } | null>(null);

  const { readAsArrayBuffer, fileInfo, clear: clearFileInfo } = useFileHandler();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setOutput('');
      setError(null);
      setStats({});
      setIsDataUrl(false);
      setDecodedFileInfo(null);
      return;
    }

    if (mode === 'encode') {
      const result = encodeToBase64(debouncedInput);
      if (result.success) {
        setOutput(result.data);
        setError(null);
        setStats({
          processingTime: result.meta?.processingTime,
          inputSize: result.meta?.inputSize,
          outputSize: result.meta?.outputSize,
        });
      } else {
        setOutput('');
        setError(result.error.message);
        setStats({});
      }
      setIsDataUrl(false);
      setDecodedFileInfo(null);
    } else {
      const trimmed = debouncedInput.trim();
      const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,/);
      const detectedDataUrl = !!dataUrlMatch;
      setIsDataUrl(detectedDataUrl);

      const result = decodeFromBase64(trimmed);
      if (result.success) {
        setOutput(result.data);
        setError(null);
        setStats({
          processingTime: result.meta?.processingTime,
          inputSize: result.meta?.inputSize,
          outputSize: result.meta?.outputSize,
        });
        if (detectedDataUrl) {
          setDecodedFileInfo({ mimeType: dataUrlMatch![1] });
        } else {
          setDecodedFileInfo(null);
        }
      } else {
        setOutput('');
        setError(result.error.message);
        setStats({});
        setDecodedFileInfo(null);
      }
    }
  }, [debouncedInput, mode]);

  const handleModeSwitch = () => {
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    setInput('');
    setOutput('');
    setError(null);
    setStats({});
    setIsDataUrl(false);
    setDecodedFileInfo(null);
    clearFileInfo();
  };

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await readAsArrayBuffer(file);
      const result = encodeFileToBase64(arrayBuffer);
      if (result.success) {
        const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${result.data}`;
        setInput(dataUrl);
        setOutput(result.data);
        setError(null);
        setStats({
          processingTime: result.meta?.processingTime,
          inputSize: result.meta?.inputSize,
          outputSize: result.meta?.outputSize,
        });
      } else {
        setError(result.error.message);
        setOutput('');
      }
    } catch {
      setError('文件读取失败');
    }
  }, [readAsArrayBuffer]);

  const handleDecodeDownload = useCallback(() => {
    if (!debouncedInput.trim()) return;
    const result = decodeBase64ToFile(debouncedInput);
    if (result.success) {
      const blob = new Blob([result.data.data], { type: result.data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decoded.${result.data.mimeType.split('/')[1] || 'bin'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [debouncedInput]);

  return (
    <ConverterLayout
      title="Base64 编码/解码"
      description="在文本和 Base64 之间转换，支持文件编码为 Base64 以及 Base64 解码为文件"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => mode !== 'encode' && handleModeSwitch()}
          className={`flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80'
          }`}
        >
          <Lock className="h-4 w-4" />
          编码 (Encode)
        </button>
        <button
          onClick={() => mode !== 'decode' && handleModeSwitch()}
          className={`flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80'
          }`}
        >
          <Unlock className="h-4 w-4" />
          解码 (Decode)
        </button>
        <Button variant="ghost" size="sm" onClick={handleModeSwitch} className="ml-auto">
          <ArrowRightLeft className="h-4 w-4" />
          切换
        </Button>
      </div>

      {mode === 'encode' && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5"
          >
            <FileUp className="h-4 w-4" />
            上传文件编码
          </Button>
          {fileInfo && (
            <Badge variant="secondary">
              {fileInfo.name} ({fileInfo.size})
            </Badge>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel
          value={input}
          onChange={setInput}
          placeholder={mode === 'encode' ? '在此输入要编码的文本...' : '在此输入 Base64 字符串...'}
        />
        <OutputPanel
          value={output}
          label={mode === 'encode' ? 'Base64 编码结果' : '解码结果'}
          filename={mode === 'encode' ? 'base64-encoded.txt' : 'decoded.txt'}
          mimeType="text/plain"
        />
      </div>

      {mode === 'decode' && isDataUrl && (
        <div className="flex items-center gap-3">
          <Badge variant="outline">检测到 Data URL</Badge>
          {decodedFileInfo && (
            <span className="text-xs text-[var(--muted-foreground)]">
              MIME 类型: {decodedFileInfo.mimeType}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleDecodeDownload} className="gap-1.5 ml-auto">
            <Download className="h-4 w-4" />
            下载解码文件
          </Button>
        </div>
      )}

      {error && <ErrorDisplay error={error} />}

      <ConversionStats
        processingTime={stats.processingTime}
        inputSize={stats.inputSize}
        outputSize={stats.outputSize}
      />
    </ConverterLayout>
  );
}
