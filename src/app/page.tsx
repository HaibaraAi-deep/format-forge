import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { SearchBar } from '@/components/home/SearchBar';
import { toolConfigs } from '@/config/routes';
import { categoryLabels, categoryColors, getToolIcon, type ToolConfig } from '@/config/tools';

export default function HomePage() {
  const [search, setSearch] = useState('');

  const filteredTools = useMemo(() => {
    if (!search.trim()) return toolConfigs;
    const q = search.toLowerCase();
    return toolConfigs.filter(
      (tool: ToolConfig) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k: string) => k.includes(q)),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof toolConfigs> = {};
    for (const tool of filteredTools) {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
    }
    return groups;
  }, [filteredTools]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-[var(--primary)]">Format</span>Forge
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] mb-2">
          在线格式转换器
        </p>
        <p className="text-sm text-[var(--muted-foreground)] flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          所有数据在浏览器本地处理，绝不上传服务器
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-10">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {Object.entries(grouped).map(([category, categoryTools]) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${categoryColors[category] || ''}`}
            >
              {categoryLabels[category] || category}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTools.map((tool: ToolConfig) => (
              <Link
                key={tool.id}
                to={tool.path}
                className="group block p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                    {getToolIcon(tool.icon)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--card-foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">未找到匹配的工具</p>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="text-2xl mb-2">🔒</div>
          <h3 className="font-semibold mb-1">隐私安全</h3>
          <p className="text-sm text-[var(--muted-foreground)]">所有数据处理在浏览器端完成</p>
        </div>
        <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-semibold mb-1">离线可用</h3>
          <p className="text-sm text-[var(--muted-foreground)]">支持 PWA 离线使用</p>
        </div>
        <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="text-2xl mb-2">🆓</div>
          <h3 className="font-semibold mb-1">开源免费</h3>
          <p className="text-sm text-[var(--muted-foreground)]">MIT 协议，欢迎社区贡献</p>
        </div>
      </div>
    </div>
  );
}
