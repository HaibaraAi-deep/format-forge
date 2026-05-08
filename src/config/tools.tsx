import type { LazyExoticComponent, ComponentType } from 'react';
import {
  ArrowLeftRight,
  Binary,
  Lock,
  Palette,
  FileJson,
  FileText,
  Link2,
  Clock,
  FileCode,
  KeyRound,
  Shield,
} from 'lucide-react';
import type { ToolInfo } from '@/types/converter';

export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType> | ComponentType;
}

export interface ToolConfig extends ToolInfo {
  route: RouteConfig;
}

export const categoryLabels: Record<string, string> = {
  data: '数据转换',
  encoding: '编解码',
  crypto: '加密安全',
  color: '颜色工具',
  text: '文本处理',
  binary: '二进制',
};

export const categoryColors: Record<string, string> = {
  data: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  encoding: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  crypto: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  text: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  binary: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const iconMap: Record<string, React.ReactNode> = {
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

export function getToolIcon(iconName: string): React.ReactNode {
  return iconMap[iconName] || <ArrowLeftRight className="w-6 h-6" />;
}
