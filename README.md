[English](#english) | 中文

# 🌐 FormatForge — 在线格式转换器

> 纯前端格式转换工具集，所有数据在浏览器本地处理，绝不上传服务器。

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ 特性

- 🔒 **隐私安全** — 所有数据处理在浏览器端完成，零上传
- ⚡ **离线可用** — 支持 PWA，离线也能使用
- 🆓 **开源免费** — MIT 协议，欢迎社区贡献
- 🎨 **双主题** — 支持亮色/暗色/跟随系统
- 📱 **响应式** — 支持桌面端和移动端
- ⚡ **实时转换** — 输入即转换，无需点击按钮

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand |
| 路由 | React Router 7 |
| 图标 | Lucide React |
| 测试 | Vitest + Testing Library |

## 📦 功能列表

| # | 工具 | 说明 |
|---|------|------|
| 1 | JSON ↔ CSV | JSON 数组与 CSV 互转，支持自定义分隔符 |
| 2 | Base64 编解码 | 文本/文件的 Base64 编码与解码 |
| 3 | 文本加密/解密 | AES-256-GCM 加密解密，PBKDF2 密钥派生 |
| 4 | 颜色格式转换 | HEX / RGB / HSL / RGBA / HSLA 互转 |
| 5 | JSON 格式化/压缩 | JSON 美化、压缩、语法校验 |
| 6 | Markdown → HTML | Markdown 实时预览与 HTML 导出 |
| 7 | URL 编解码 | URL 编码解码 + 查询参数解析与构建 |
| 8 | 时间戳转换 | Unix 时间戳与日期互转 |
| 9 | YAML ↔ JSON | YAML 与 JSON 互转 |
| 10 | XML ↔ JSON | XML 与 JSON 互转 |
| 11 | 二进制查看器 | 十六进制查看文件内容 |
| 12 | JWT 解析 | JWT Token 解码与过期检测 |

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/HaibaraAi-deep/format-forge.git
cd format-forge

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run lint` | 运行 ESLint |
| `npm run lint:fix` | 自动修复 ESLint 问题 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run test` | 运行测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |

## 🏗️ 项目结构

```
src/
├── app/                    # 页面入口
├── components/             # 组件
│   ├── converter/          # 转换器通用组件
│   ├── home/               # 首页组件
│   ├── layout/             # 布局组件
│   └── ui/                 # 基础 UI 组件
├── converters/             # 转换器页面
├── hooks/                  # 自定义 Hooks
├── lib/                    # 工具库
├── services/               # 业务逻辑（纯函数）
│   └── converters/         # 各转换器核心逻辑
├── store/                  # 状态管理
├── styles/                 # 全局样式
├── types/                  # 类型定义
└── utils/                  # 工具函数
```

## 🤝 参与贡献

欢迎贡献！请阅读 [贡献指南](./docs/contributing.md) 了解开发流程和规范。

## 📄 许可证

[MIT License](./LICENSE) © HaibaraAi-deep

---

<a id="english"></a>

English | [中文](#)

# 🌐 FormatForge — Online Format Converter

> A pure front-end format conversion toolkit. All data is processed locally in your browser — nothing is ever uploaded to a server.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ Features

- 🔒 **Privacy First** — All data processing happens in your browser, zero uploads
- ⚡ **Offline Ready** — PWA support for offline usage
- 🆓 **Free & Open Source** — MIT License, community contributions welcome
- 🎨 **Dual Theme** — Light / Dark / System preference
- 📱 **Responsive** — Desktop and mobile friendly
- ⚡ **Real-time Conversion** — Instant results as you type

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Routing | React Router 7 |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |

## 📦 Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | JSON ↔ CSV | Convert between JSON arrays and CSV |
| 2 | Base64 Encode/Decode | Encode/decode text and files to/from Base64 |
| 3 | Text Encrypt/Decrypt | AES-256-GCM encryption with PBKDF2 key derivation |
| 4 | Color Converter | Convert between HEX / RGB / HSL / RGBA / HSLA |
| 5 | JSON Formatter | Beautify, minify, and validate JSON |
| 6 | Markdown → HTML | Live Markdown preview with HTML export |
| 7 | URL Encode/Decode | URL encoding/decoding + query parameter parsing |
| 8 | Timestamp Converter | Convert between Unix timestamps and dates |
| 9 | YAML ↔ JSON | Convert between YAML and JSON |
| 10 | XML ↔ JSON | Convert between XML and JSON |
| 11 | Hex Viewer | View file contents in hexadecimal |
| 12 | JWT Parser | Decode JWT tokens with expiration detection |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/HaibaraAi-deep/format-forge.git
cd format-forge

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run type-check` | TypeScript type checking |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## 🏗️ Project Structure

```
src/
├── app/                    # Page entries
├── components/             # Components
│   ├── converter/          # Shared converter components
│   ├── home/               # Home page components
│   ├── layout/             # Layout components
│   └── ui/                 # Base UI components
├── converters/             # Converter pages
├── hooks/                  # Custom hooks
├── lib/                    # Utility libraries
├── services/               # Business logic (pure functions)
│   └── converters/         # Core converter logic
├── store/                  # State management
├── styles/                 # Global styles
├── types/                  # Type definitions
└── utils/                  # Utility functions
```

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](./docs/contributing.md) for development workflow and conventions.

## 📄 License

[MIT License](./LICENSE) © HaibaraAi-deep
