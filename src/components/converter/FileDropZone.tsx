import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFileLoad: (content: string, file: File) => void;
  accept?: string;
  isDragOver?: boolean;
  onDragOverChange?: (value: boolean) => void;
}

export function FileDropZone({
  onFileLoad,
  accept,
  isDragOver: externalDragOver,
  onDragOverChange: externalSetDragOver,
}: FileDropZoneProps) {
  const [internalDragOver, setInternalDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDragOver = externalDragOver ?? internalDragOver;
  const setDragOver = externalSetDragOver ?? setInternalDragOver;

  const isAcceptedType = useCallback(
    (file: File) => {
      if (!accept) return true;
      const acceptList = accept.split(',').map((t) => t.trim().toLowerCase());
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type.toLowerCase();

      return acceptList.some((pattern) => {
        if (pattern.startsWith('.')) return fileExt === pattern;
        if (pattern.endsWith('/*')) return fileType.startsWith(pattern.replace('/*', '/'));
        return fileType === pattern;
      });
    },
    [accept],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!isAcceptedType(file)) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        onFileLoad(content, file);
      };
      reader.readAsText(file);
    },
    [isAcceptedType, onFileLoad],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="拖拽文件到此处或点击浏览上传"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-dashed p-6 cursor-pointer transition-colors',
          isDragOver
            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
            : 'border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--muted)]/50',
        )}
      >
        <Upload
          className={cn(
            'h-6 w-6 transition-colors',
            isDragOver ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]',
          )}
        />
        <p className="text-sm text-[var(--muted-foreground)]">
          拖拽文件到此处，或<span className="text-[var(--primary)]">点击浏览</span>
        </p>
        {accept && (
          <p className="text-xs text-[var(--muted-foreground)]">
            支持格式: {accept}
          </p>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </>
  );
}
