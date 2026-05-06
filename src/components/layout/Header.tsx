import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-[var(--foreground)]">
            <ArrowLeftRight className="h-5 w-5 text-[var(--primary)]" />
            <span>FormatForge</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              首页
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
