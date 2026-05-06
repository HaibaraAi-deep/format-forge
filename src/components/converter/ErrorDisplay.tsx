import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorObject {
  code?: string;
  message: string;
  details?: string;
}

interface ErrorDisplayProps {
  error: string | ErrorObject;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  const errorObj: ErrorObject = typeof error === 'string' ? { message: error } : error;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius)] border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4',
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--destructive)]" />
      <div className="flex flex-col gap-1">
        {errorObj.code && (
          <span className="text-xs font-mono text-[var(--destructive)]/80">
            错误代码: {errorObj.code}
          </span>
        )}
        <p className="text-sm font-medium text-[var(--destructive)]">
          {errorObj.message}
        </p>
        {errorObj.details && (
          <p className="text-xs text-[var(--destructive)]/70 mt-1">
            {errorObj.details}
          </p>
        )}
      </div>
    </div>
  );
}
