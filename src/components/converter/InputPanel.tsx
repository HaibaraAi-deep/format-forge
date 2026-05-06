import { useCallback, useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileDropZone } from './FileDropZone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  acceptFileTypes?: string;
  onFileLoad?: (content: string, file: File) => void;
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InputPanel({
  value,
  onChange,
  placeholder = '在此输入内容...',
  acceptFileTypes,
  onFileLoad,
}: InputPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const byteSize = new TextEncoder().encode(value).length;

  const handleFileLoad = useCallback(
    (content: string, file: File) => {
      if (onFileLoad) {
        onFileLoad(content, file);
      } else {
        onChange(content);
      }
    },
    [onFileLoad, onChange],
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      handleFileLoad(content, file);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--foreground)]">输入</label>
        {acceptFileTypes && (
          <button
            onClick={handleBrowseClick}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--radius)] px-2.5 py-1 text-xs',
              'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
              'transition-colors',
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            上传文件
          </button>
        )}
      </div>

      {acceptFileTypes && onFileLoad && (
        <FileDropZone
          onFileLoad={handleFileLoad}
          accept={acceptFileTypes}
          isDragOver={isDragOver}
          onDragOverChange={setIsDragOver}
        />
      )}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] font-mono text-sm resize-y"
      />

      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>{value.length} 字符</span>
        <span>{formatByteSize(byteSize)}</span>
      </div>

      {acceptFileTypes && (
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptFileTypes}
          onChange={handleFileInputChange}
          className="hidden"
        />
      )}
    </div>
  );
}
