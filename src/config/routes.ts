import { lazy } from 'react';
import type { ToolConfig } from '@/config/tools';

const JsonCsvPage = lazy(() => import('@/converters/json-csv/page'));
const Base64Page = lazy(() => import('@/converters/base64/page'));
const CryptoPage = lazy(() => import('@/converters/crypto/page'));
const ColorPage = lazy(() => import('@/converters/color/page'));
const JsonFormatterPage = lazy(() => import('@/converters/json-formatter/page'));
const MarkdownPage = lazy(() => import('@/converters/markdown/page'));
const UrlPage = lazy(() => import('@/converters/url/page'));
const TimestampPage = lazy(() => import('@/converters/timestamp/page'));
const YamlJsonPage = lazy(() => import('@/converters/yaml-json/page'));
const XmlJsonPage = lazy(() => import('@/converters/xml-json/page'));
const HexViewerPage = lazy(() => import('@/converters/hex-viewer/page'));
const JwtPage = lazy(() => import('@/converters/jwt/page'));

export const toolConfigs: ToolConfig[] = [
  {
    id: 'json-csv',
    name: 'JSON ↔ CSV',
    description: 'JSON 数组与 CSV 表格互转，支持自定义分隔符和嵌套扁平化',
    category: 'data',
    icon: 'table',
    path: '/json-csv',
    keywords: ['json', 'csv', '表格', '转换', '分隔符', '逗号'],
    route: { path: '/json-csv', component: JsonCsvPage },
  },
  {
    id: 'base64',
    name: 'Base64 编解码',
    description: '文本和文件的 Base64 编码与解码，支持 Unicode 和文件类型检测',
    category: 'encoding',
    icon: 'binary',
    path: '/base64',
    keywords: ['base64', '编码', '解码', '加密', '文件'],
    route: { path: '/base64', component: Base64Page },
  },
  {
    id: 'crypto',
    name: '文本加密/解密',
    description: 'AES-GCM 加密解密，PBKDF2 密钥派生，密码强度检测',
    category: 'crypto',
    icon: 'lock',
    path: '/crypto',
    keywords: ['加密', '解密', 'aes', 'gcm', '密码', '安全'],
    route: { path: '/crypto', component: CryptoPage },
  },
  {
    id: 'color',
    name: '颜色格式转换',
    description: 'HEX / RGB / HSL / RGBA / HSLA 互转，可视化取色和预览',
    category: 'color',
    icon: 'palette',
    path: '/color',
    keywords: ['颜色', 'hex', 'rgb', 'hsl', '转换', '取色器'],
    route: { path: '/color', component: ColorPage },
  },
  {
    id: 'json-formatter',
    name: 'JSON 格式化/压缩',
    description: 'JSON 美化、压缩、语法校验，支持错误定位和多种缩进',
    category: 'data',
    icon: 'code',
    path: '/json-formatter',
    keywords: ['json', '格式化', '压缩', '美化', '校验', '验证'],
    route: { path: '/json-formatter', component: JsonFormatterPage },
  },
  {
    id: 'markdown',
    name: 'Markdown → HTML',
    description: 'Markdown 实时预览与 HTML 导出，支持 GFM 语法',
    category: 'text',
    icon: 'file-text',
    path: '/markdown',
    keywords: ['markdown', 'html', '预览', '转换', 'gfm'],
    route: { path: '/markdown', component: MarkdownPage },
  },
  {
    id: 'url',
    name: 'URL 编解码',
    description: 'URL 编码/解码，查询参数解析与构建',
    category: 'encoding',
    icon: 'link',
    path: '/url',
    keywords: ['url', '编码', '解码', '参数', '查询', 'query'],
    route: { path: '/url', component: UrlPage },
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: 'Unix 时间戳与日期字符串互转，实时时间戳显示',
    category: 'text',
    icon: 'clock',
    path: '/timestamp',
    keywords: ['时间戳', 'timestamp', 'unix', '日期', '转换', '时区'],
    route: { path: '/timestamp', component: TimestampPage },
  },
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    description: 'YAML 与 JSON 格式互转，支持复杂嵌套结构',
    category: 'data',
    icon: 'file-code',
    path: '/yaml-json',
    keywords: ['yaml', 'json', '转换', '配置'],
    route: { path: '/yaml-json', component: YamlJsonPage },
  },
  {
    id: 'xml-json',
    name: 'XML ↔ JSON',
    description: 'XML 与 JSON 格式互转，支持属性和命名空间',
    category: 'data',
    icon: 'file-code',
    path: '/xml-json',
    keywords: ['xml', 'json', '转换', '属性'],
    route: { path: '/xml-json', component: XmlJsonPage },
  },
  {
    id: 'hex-viewer',
    name: '二进制查看器',
    description: '文件的十六进制/二进制查看，支持拖拽上传',
    category: 'binary',
    icon: 'binary',
    path: '/hex-viewer',
    keywords: ['hex', '二进制', '十六进制', '查看器', '文件'],
    route: { path: '/hex-viewer', component: HexViewerPage },
  },
  {
    id: 'jwt',
    name: 'JWT 解析',
    description: 'JWT Token 解码与 Payload 展示，过期时间检测',
    category: 'crypto',
    icon: 'key',
    path: '/jwt',
    keywords: ['jwt', 'token', '解析', '解码', '过期'],
    route: { path: '/jwt', component: JwtPage },
  },
];
