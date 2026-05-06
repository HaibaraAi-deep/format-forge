import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  category: string;
}

interface ToolCardProps {
  tool: ToolInfo;
}

export function ToolCard({ tool }: ToolCardProps) {
  const navigate = useNavigate();
  const Icon = tool.icon;

  return (
    <button
      onClick={() => navigate(tool.path)}
      className={cn(
        'group flex flex-col items-start gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-5 text-left',
        'shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-[var(--primary)]/40 hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)]/10 text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)]/20">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-sm text-[var(--card-foreground)]">
          {tool.name}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
          {tool.description}
        </p>
      </div>
    </button>
  );
}
