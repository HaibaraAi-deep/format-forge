import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-[var(--muted-foreground)]">
            🔒 所有数据在浏览器本地处理，绝不上传服务器
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/HaibaraAi-deep/format-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="GitHub"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-xs text-[var(--muted-foreground)]">
              MIT License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
