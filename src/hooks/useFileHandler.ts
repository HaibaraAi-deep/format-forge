import { useState, useCallback } from 'react';
import { readFileAsText, readFileAsArrayBuffer, formatFileSize } from '@/utils/file';

interface FileInfo {
  name: string;
  size: string;
  type: string;
}

export function useFileHandler() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  const readAsText = useCallback(async (file: File): Promise<string> => {
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'unknown',
    });
    return readFileAsText(file);
  }, []);

  const readAsArrayBuffer = useCallback(async (file: File): Promise<ArrayBuffer> => {
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'unknown',
    });
    return readFileAsArrayBuffer(file);
  }, []);

  const clear = useCallback(() => {
    setFileInfo(null);
  }, []);

  return { fileInfo, readAsText, readAsArrayBuffer, clear };
}
