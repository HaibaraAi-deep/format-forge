import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionStatsProps {
  processingTime?: number;
  inputSize?: number;
  outputSize?: number;
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function ConversionStats({ processingTime, inputSize, outputSize }: ConversionStatsProps) {
  const hasStats = processingTime !== undefined || inputSize !== undefined || outputSize !== undefined;

  if (!hasStats) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
      {processingTime !== undefined && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(processingTime)}
        </span>
      )}
      {inputSize !== undefined && outputSize !== undefined && (
        <span className="inline-flex items-center gap-1">
          {formatByteSize(inputSize)}
          <ArrowRight className="h-3 w-3" />
          {formatByteSize(outputSize)}
        </span>
      )}
      {inputSize !== undefined && outputSize !== undefined && inputSize > 0 && (
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          outputSize < inputSize
            ? 'bg-[var(--success)]/10 text-[var(--success)]'
            : 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
        )}>
          {outputSize < inputSize ? '-' : '+'}
          {Math.abs(Math.round(((outputSize - inputSize) / inputSize) * 100))}%
        </span>
      )}
    </div>
  );
}
