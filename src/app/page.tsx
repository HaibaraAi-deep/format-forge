import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Shield, Palette, FileJson, FileText, Link2, Clock, FileCode, Binary, KeyRound, Lock } from 'lucide-react';
import { SearchBar } from '@/components/home/SearchBar';
import type { ToolInfo } from '@/types/converter';

const tools: ToolInfo[] = [
  {
    id: 'json-csv',
    name: 'JSON ↔ CSV',
    description: 'JSON 数组与 CSV 表格互转，支持自定义分隔符和嵌套扁平化',
    category: 'data',
    icon: 'table',
    path: '/json-csv',
    keywords: ['json', 'csv', '表格', '转换', '分隔符', '逗号'],
  },
  {
    id: 'base64',
    name: 'Base64 编解码',
    description: '文本和文件的 Base64 编码与解码，支持 Unicode 和文件类型检测',
    category: 'encoding',
    icon: 'binary',
    path: '/base64',
    keywords: ['base64', '编码', '解码', '加密', '文件'],
  },
  {
    id: 'crypto',
    name: '文本加密/解密',
    description: 'AES-GCM 加密解密，PBKDF2 密钥派生，密码强度检测',
    category: 'crypto',
    icon: 'lock',
    path: '/crypto',
    keywords: ['加密', '解密', 'aes', 'gcm', '密码', '安全'],
  },
  {
    id: 'color',
    name: '颜色格式转换',
    description: 'HEX / RGB / HSL / RGBA / HSLA 互转，可视化取色和预览',
    category: 'color',
    icon: 'palette',
    path: '/color',
    keywords: ['颜色', 'hex', 'rgb', 'hsl', '转换', '取色器'],
  },
  {
    id: 'json-formatter',
    name: 'JSON 格式化/压缩',
    description: 'JSON 美化、压缩、语法校验，支持错误定位和多种缩进',
    category: 'data',
    icon: 'code',
    path: '/json-formatter',
    keywords: ['json', '格式化', '压缩', '美化', '校验', '验证'],
  },
  {
    id: 'markdown',
    name: 'Markdown → HTML',
    description: 'Markdown 实时预览与 HTML 导出，支持 GFM 语法',
    category: 'text',
    icon: 'file-text',
    path: '/markdown',
    keywords: ['markdown', 'html', '预览', '转换', 'gfm'],
  },
  {
    id: 'url',
    name: 'URL 编解码',
    description: 'URL 编码/解码，查询参数解析与构建',
    category: 'encoding',
    icon: 'link',
    path: '/url',
    keywords: ['url', '编码', '解码', '参数', '查询', 'query'],
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: 'Unix 时间戳与日期字符串互转，实时时间戳显示',
    category: 'text',
    icon: 'clock',
    path: '/timestamp',
    keywords: ['时间戳', 'timestamp', 'unix', '日期', '转换', '时区'],
  },
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    description: 'YAML 与 JSON 格式互转，支持复杂嵌套结构',
    category: 'data',
    icon: 'file-code',
    path: '/yaml-json',
    keywords: ['yaml', 'json', '转换', '配置'],
  },
  {
    id: 'xml-json',
    name: 'XML ↔ JSON',
    description: 'XML 与 JSON 格式互转，支持属性和命名空间',
    category: 'data',
    icon: 'file-code',
    path: '/xml-json',
    keywords: ['xml', 'json', '转换', '属性'],
  },
  {
    id: 'hex-viewer',
    name: '二进制查看器',
    description: '文件的十六进制/二进制查看，支持拖拽上传',
    category: 'binary',
    icon: 'binary',
    path: '/hex-viewer',
    keywords: ['hex', '二进制', '十六进制', '查看器', '文件'],
  },
  {
    id: 'jwt',
    name: 'JWT 解析',
    description: 'JWT Token 解码与 Payload 展示，过期时间检测',
    category: 'crypto',
    icon: 'key',
    path: '/jwt',
    keywords: ['jwt', 'token', '解析', '解码', '过期'],
  },
];

const iconMap: Record<string, React.ReactNode> = {
  table: <ArrowLeftRight className="w-6 h-6" />,
  binary: <Binary className="w-6 h-6" />,
  lock: <Lock className="w-6 h-6" />,
  palette: <Palette className="w-6 h-6" />,
  code: <FileJson className="w-6 h-6" />,
  'file-text': <FileText className="w-6 h-6" />,
  link: <Link2 className="w-6 h-6" />,
  clock: <Clock className="w-6 h-6" />,
  'file-code': <FileCode className="w-6 h-6" />,
  key: <KeyRound className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
};

const categoryLabels: Record<string, string> = {
  data: '数据转换',
  encoding: '编解码',
  crypto: '加密安全',
  color: '颜色工具',
  text: '文本处理',
  binary: '二进制',
};

const categoryColors: Record<string, string> = {
  data: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  encoding: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  crypto: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  text: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  binary: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function HomePage() {
  const [search, setSearch] = useState('');

  const filteredTools = useMemo(() => {
    if (!search.trim()) return tools;
    const q = search.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.includes(q)),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, ToolInfo[]> = {};
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
            {categoryTools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className="group block p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                    {iconMap[tool.icon] || <ArrowLeftRight className="w-6 h-6" />}
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
