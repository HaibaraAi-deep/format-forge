import type { ReactNode } from 'react';
import { Shield } from 'lucide-react';

interface ConverterLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ConverterLayout({ title, description, children }: ConverterLayoutProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <Shield className="h-3.5 w-3.5" />
        <span>所有数据在浏览器本地处理，绝不上传服务器</span>
      </div>
    </div>
  );
}
