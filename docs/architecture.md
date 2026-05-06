# FormatForge 技术架构文档

## 1. 系统架构概述

FormatForge 是一个**纯前端在线格式转换工具集**，采用零后端依赖架构。所有数据转换、加密解密、格式处理均在用户浏览器端完成，不会将任何用户数据上传至服务器。

### 核心设计原则

| 原则 | 说明 |
|------|------|
| 零后端依赖 | 无 API 调用、无数据库、无服务端逻辑 |
| 隐私优先 | 所有数据处理在浏览器本地完成，绝不上传服务器 |
| 离线可用 | 通过 PWA 支持离线访问 |
| 类型安全 | TypeScript 全量覆盖，编译期消除类型错误 |
| 可扩展 | 统一转换接口，新增转换器只需实现 Converter 接口 |

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| UI 框架 | React | 19.x |
| 状态管理 | Zustand | 5.x |
| 路由 | React Router DOM | 7.x |
| 样式 | Tailwind CSS | 4.x |
| 构建工具 | Vite | 8.x |
| 语言 | TypeScript | 6.x |
| 测试 | Vitest + Testing Library | 4.x |
| 代码规范 | ESLint + typescript-eslint | 10.x / 8.x |

---

## 2. 分层设计

系统采用四层架构，各层职责明确、边界清晰：

```
┌─────────────────────────────────────────────┐
│                  UI 层                       │
│  components/  converters/  app/              │
│  负责：渲染、用户交互、布局                    │
├─────────────────────────────────────────────┤
│              业务逻辑层                       │
│  hooks/  store/                              │
│  负责：状态管理、逻辑复用、数据编排             │
├─────────────────────────────────────────────┤
│               工具层                         │
│  services/  utils/  types/                   │
│  负责：纯函数转换、校验、类型定义               │
├─────────────────────────────────────────────┤
│               PWA 层                         │
│  manifest.json  Service Worker               │
│  负责：离线缓存、安装体验                      │
└─────────────────────────────────────────────┘
```

### 各层约束

- **UI 层** → 不直接调用 services，必须通过 hooks 间接调用
- **业务逻辑层** → 不包含 DOM 操作，只管理状态和编排逻辑
- **工具层** → 纯函数，无副作用，不依赖 React，可独立测试
- **PWA 层** → 独立于业务逻辑，只负责缓存策略和安装体验

---

## 3. 数据流设计

FormatForge 的核心数据流遵循单向数据流原则：

```
用户输入 → 校验 → 转换 → 输出 → 复制/下载
   │         │       │       │        │
   ▼         ▼       ▼       ▼        ▼
InputPanel  validate  convert  Result  OutputPanel
  onChange    ↓        ↓        ↓      copy/download
  setInput  Result<T> Result<T> data   clipboard/file
```

### 详细流程

1. **用户输入** — 用户在 `InputPanel` 中输入文本或拖拽上传文件
2. **防抖处理** — 输入经 `useDebounce` (300ms) 防抖后触发转换
3. **校验** — 服务层函数首先校验输入合法性（空值、格式等）
4. **转换** — 调用对应的 service 纯函数执行转换，返回 `Result<T>`
5. **输出** — 根据 `Result<T>` 的 `success` 字段分支处理：
   - 成功：将 `data` 渲染到 `OutputPanel`，展示 `ConversionStats`
   - 失败：将 `error` 渲染到 `ErrorDisplay`
6. **复制/下载** — 用户通过 `OutputPanel` 的复制按钮或下载按钮操作结果

---

## 4. 统一转换接口

### Result<T> 类型设计

所有转换函数的返回值统一为 `Result<T>` 类型，采用可辨识联合类型（Discriminated Union）：

```typescript
interface ConversionResult<T> {
  success: true;
  data: T;
  meta?: {
    processingTime: number;   // 处理耗时（ms）
    inputSize: number;        // 输入字节大小
    outputSize: number;       // 输出字节大小
  };
}

interface ConversionError {
  success: false;
  error: {
    code: string;             // 错误代码，如 'EMPTY_INPUT'
    message: string;          // 用户可读的错误信息
    details?: string;         // 详细错误信息
    line?: number;            // 错误行号（格式化场景）
    column?: number;          // 错误列号（格式化场景）
  };
}

type Result<T> = ConversionResult<T> | ConversionError;
```

**设计要点：**

- 通过 `success` 字段进行类型窄化，TypeScript 可自动推断后续字段
- `meta` 为可选字段，仅在成功时提供性能指标
- `error.code` 便于程序化处理错误，`error.message` 面向用户展示
- `line` / `column` 用于 JSON/YAML 等结构化数据的错误定位

### Converter 接口规范

```typescript
interface Converter<TInput, TOutput> {
  id: string;                          // 唯一标识符
  name: string;                        // 工具名称
  description: string;                 // 工具描述
  category: 'data' | 'encoding' | 'crypto' | 'color' | 'text' | 'binary';
  icon: string;                        // 图标标识
  path: string;                        // 路由路径
  convert: (input: TInput) => TOutput | Promise<TOutput>;
  validate?: (input: TInput) => string | null;
}
```

### ToolInfo 接口

用于首页工具卡片展示和搜索：

```typescript
interface ToolInfo {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'encoding' | 'crypto' | 'color' | 'text' | 'binary';
  icon: string;
  path: string;
  keywords: string[];                  // 搜索关键词
}
```

---

## 5. 核心模块说明

### 5.1 类型系统 (types/)

```
src/types/
├── conversion.ts    # Result<T>、ConversionResult、ConversionError
├── converter.ts     # Converter<TInput,TOutput>、ToolInfo
└── index.ts         # 统一导出
```

类型系统是整个项目的契约层，定义了转换函数的输入输出规范。所有 service 函数和 component 均依赖此类型系统，确保端到端类型安全。

### 5.2 服务层 (services/)

```
src/services/
├── index.ts                    # 统一导出所有转换器
└── converters/
    ├── base64.ts               # Base64 编解码
    ├── color.ts                # 颜色格式转换
    ├── crypto.ts               # AES-GCM 加密解密
    ├── hex-viewer.ts           # 十六进制查看
    ├── json-csv.ts             # JSON ↔ CSV 互转
    ├── json-formatter.ts       # JSON 格式化/压缩
    ├── jwt.ts                  # JWT 解析
    ├── markdown.ts             # Markdown → HTML
    ├── timestamp.ts            # 时间戳转换
    ├── url.ts                  # URL 编解码
    ├── xml-json.ts             # XML ↔ JSON 互转
    └── yaml-json.ts            # YAML ↔ JSON 互转
```

**设计原则：**

- **纯函数设计** — 所有转换函数为纯函数，输入相同则输出相同，无副作用
- **无 React 依赖** — 不导入任何 React API，可独立测试
- **统一返回类型** — 所有函数返回 `Result<T>`，调用方无需 try-catch
- **性能指标** — 成功时通过 `meta` 字段返回处理耗时和数据大小
- **异步支持** — 加密解密等操作返回 `Promise<Result<T>>`，使用 Web Crypto API

**示例 — Base64 编码函数：**

```typescript
export function encodeToBase64(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (input === '') {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Input string is empty' },
    };
  }

  try {
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const encoded = btoa(binary);
    const outputSize = new TextEncoder().encode(encoded).length;

    return {
      success: true,
      data: encoded,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'ENCODE_ERROR',
        message: 'Failed to encode input to Base64',
        details: e instanceof Error ? e.message : 'Unknown error',
      },
    };
  }
}
```

### 5.3 组件层 (components/)

```
src/components/
├── converter/                  # 转换器通用组件
│   ├── ConverterLayout.tsx     # 转换器页面布局壳
│   ├── InputPanel.tsx          # 输入面板（文本输入 + 文件拖拽）
│   ├── OutputPanel.tsx         # 输出面板（结果展示 + 复制/下载）
│   ├── ErrorDisplay.tsx        # 错误展示组件
│   ├── ConversionStats.tsx     # 转换统计（耗时、大小变化）
│   └── FileDropZone.tsx        # 文件拖拽上传区域
├── home/                       # 首页组件
│   ├── SearchBar.tsx           # 工具搜索栏
│   └── ToolCard.tsx            # 工具卡片
├── layout/                     # 布局组件
│   ├── Header.tsx              # 顶部导航栏
│   ├── Footer.tsx              # 底部信息栏
│   └── ThemeToggle.tsx         # 主题切换器
└── ui/                         # 基础 UI 组件
    ├── badge.tsx
    ├── button.tsx
    ├── input.tsx
    ├── textarea.tsx
    └── toast.tsx
```

#### 通用转换器布局模式

每个转换器页面遵循统一的布局模式：

```
ConverterLayout（标题 + 描述 + 隐私提示）
├── 模式切换区（编码/解码、加密/解密等）
├── 特定配置区（密码输入、分隔符选择等）
├── 输入输出区（grid 两栏布局）
│   ├── InputPanel
│   └── OutputPanel
├── ErrorDisplay（条件渲染）
└── ConversionStats（条件渲染）
```

`ConverterLayout` 组件提供统一的页面壳，包含标题、描述和隐私安全提示（"所有数据在浏览器本地处理，绝不上传服务器"），确保每个转换器页面都有一致的外观和隐私承诺。

### 5.4 状态管理 (store/)

```
src/store/
├── theme-store.ts              # 主题状态
└── settings-store.ts           # 设置状态
```

使用 Zustand 进行轻量级状态管理，避免 Redux 的样板代码开销：

**theme-store** — 管理主题模式（light / dark / system）：
- 使用 `persist` 中间件持久化到 localStorage
- 监听系统主题变化（`prefers-color-scheme`）
- 通过 `document.documentElement.classList.toggle('dark')` 切换主题

**settings-store** — 管理应用设置：
- `autoConvert`：是否自动转换（输入即转换 vs 手动触发）

### 5.5 自定义 Hooks (hooks/)

```
src/hooks/
├── useConverter.ts             # 转换器核心逻辑 Hook
├── useClipboard.ts             # 剪贴板操作 Hook
├── use-clipboard.ts            # 剪贴板操作 Hook（备用版本）
├── useDebounce.ts              # 防抖 Hook
└── useFileHandler.ts           # 文件处理 Hook
```

| Hook | 职责 | 关键特性 |
|------|------|----------|
| `useConverter<T>` | 封装转换逻辑（输入、输出、错误、加载状态） | 泛型支持、自动/手动转换 |
| `useClipboard` | 复制文本到剪贴板 | 降级方案（`execCommand`）、2秒反馈 |
| `useDebounce<T>` | 防抖值 | 泛型支持、可配置延迟 |
| `useFileHandler` | 读取文件内容 | 支持 Text / ArrayBuffer 两种读取模式 |

**useConverter 接口：**

```typescript
interface UseConverterOptions<T> {
  convertFn: (input: string) => Result<T>;
  autoConvert?: boolean;
  debounceMs?: number;
}

interface UseConverterReturn<T> {
  input: string;
  output: Result<T> | null;
  isConverting: boolean;
  error: string | null;
  setInput: (value: string) => void;
  convert: () => void;
  reset: () => void;
}
```

---

## 6. 路由设计

使用 React Router DOM 的 `lazy` + `Suspense` 实现路由级代码分割：

```typescript
const JsonCsvPage = lazy(() => import('@/converters/json-csv/page'));
const Base64Page = lazy(() => import('@/converters/base64/page'));
// ... 其他转换器页面
```

### 路由表

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `HomePage` | 首页（工具列表 + 搜索） |
| `/json-csv` | `JsonCsvPage` | JSON ↔ CSV 互转 |
| `/base64` | `Base64Page` | Base64 编解码 |
| `/crypto` | `CryptoPage` | AES-GCM 加密/解密 |
| `/color` | `ColorPage` | 颜色格式转换 |
| `/json-formatter` | `JsonFormatterPage` | JSON 格式化/压缩 |
| `/markdown` | `MarkdownPage` | Markdown → HTML |
| `/url` | `UrlPage` | URL 编解码 |
| `/timestamp` | `TimestampPage` | 时间戳转换 |
| `/yaml-json` | `YamlJsonPage` | YAML ↔ JSON 互转 |
| `/xml-json` | `XmlJsonPage` | XML ↔ JSON 互转 |
| `/hex-viewer` | `HexViewerPage` | 二进制查看器 |
| `/jwt` | `JwtPage` | JWT 解析 |
| `*` | `NotFound` | 404 页面 |

**懒加载策略：**

- 首页 `HomePage` 为同步导入（首屏关键路径）
- 所有转换器页面使用 `lazy()` 动态导入
- `Suspense` 包裹路由区域，加载时展示统一的 Loading 动画

---

## 7. 主题系统

### 实现方式

采用 **CSS 变量 + `.dark` 类名** 的双重机制：

1. `:root` 定义亮色主题变量
2. `.dark` 覆盖为暗色主题变量
3. Tailwind CSS 通过 `@custom-variant dark (&:where(.dark, .dark *))` 适配

### CSS 变量体系

```css
:root {
  --background: #FAFAFA;
  --foreground: #111827;
  --card: #FFFFFF;
  --primary: #2563EB;
  --primary-foreground: #FFFFFF;
  --secondary: #F3F4F6;
  --muted: #F3F4F6;
  --muted-foreground: #6B7280;
  --destructive: #DC2626;
  --border: #E5E7EB;
  --ring: #2563EB;
  --success: #16A34A;
  /* ... */
}

.dark {
  --background: #0F0F0F;
  --foreground: #F9FAFB;
  --card: #1A1A1A;
  --primary: #3B82F6;
  --secondary: #1F2937;
  --muted: #1F2937;
  --muted-foreground: #9CA3AF;
  --destructive: #EF4444;
  --border: #374151;
  --success: #22C55E;
  /* ... */
}
```

### 主题切换流程

```
用户点击 ThemeToggle
  → useThemeStore.setTheme(theme)
  → applyTheme(theme)
  → document.documentElement.classList.toggle('dark', isDark)
  → CSS 变量自动切换
  → persist 中间件写入 localStorage('format-forge-theme')
```

### 三种模式

| 模式 | 行为 |
|------|------|
| `light` | 强制亮色 |
| `dark` | 强制暗色 |
| `system` | 跟随 `prefers-color-scheme`，监听系统主题变化 |

---

## 8. 构建优化

### Vite 构建配置

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/papaparse') || id.includes('node_modules/marked') || id.includes('node_modules/dompurify') || id.includes('node_modules/js-yaml') || id.includes('node_modules/fast-xml-parser')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
});
```

### 优化策略

| 策略 | 实现方式 | 效果 |
|------|----------|------|
| 路由级代码分割 | `React.lazy()` + `Suspense` | 每个转换器页面独立 chunk，按需加载 |
| 手动 Chunk 分组 | `manualChunks` 配置 | React 生态 / 工具库 分离，优化缓存命中率 |
| Tree Shaking | Vite 内置 (Rollup) | 未使用的导出自动移除 |
| CSS 变量 | 替代 CSS-in-JS | 零运行时开销 |
| 路径别名 | `@` → `src/` | 简化导入路径 |

### 产物结构

```
dist/assets/
├── vendor-react-*.js           # React + ReactDOM + React Router
├── vendor-utils-*.js           # papaparse, marked, dompurify, js-yaml, fast-xml-parser
├── index-*.js                  # 应用入口
├── index-*.css                 # 全局样式
├── page-*.js                   # 各转换器页面（按需加载）
├── InputPanel-*.js             # 共享组件 chunk
├── OutputPanel-*.js            # 共享组件 chunk
├── ConversionStats-*.js        # 共享组件 chunk
├── ErrorDisplay-*.js           # 共享组件 chunk
├── use-clipboard-*.js          # 共享 Hook chunk
├── useClipboard-*.js           # 共享 Hook chunk
├── useDebounce-*.js            # 共享 Hook chunk
├── useFileHandler-*.js         # 共享 Hook chunk
├── arrow-right-left-*.js       # 图标 chunk
├── download-*.js               # 图标 chunk
└── lock-open-*.js              # 图标 chunk
```

---

## 9. 部署方案

### GitHub Pages + GitHub Actions

项目采用 GitHub Pages 静态部署，通过两个 GitHub Actions 工作流实现自动化：

#### CI 工作流 (`.github/workflows/ci.yml`)

在每次 push 和 PR 时触发，执行代码质量检查：

```yaml
jobs:
  test:
    steps:
      - npm ci
      - npm run lint          # ESLint 代码检查
      - npm run type-check    # TypeScript 类型检查
      - npm run build         # 构建验证
```

#### 部署工作流 (`.github/workflows/deploy.yml`)

在 main 分支 push 时触发，自动构建并部署到 GitHub Pages：

```yaml
jobs:
  build-and-deploy:
    steps:
      - npm ci
      - npm run build
      - upload-pages-artifact  # 上传 dist 目录
      - deploy-pages           # 部署到 GitHub Pages
```

**部署特性：**

- 使用 `actions/deploy-pages@v4` 官方 Action
- 并发控制：同一时间只允许一个部署任务
- Node.js 20 LTS 运行环境
- npm ci 保证依赖一致性

---

## 10. 安全设计

### 10.1 AES-GCM 加密

加密模块使用 Web Crypto API 实现 AES-256-GCM 加密：

```
加密流程：
明文 + 密码
  → PBKDF2(password, random_salt, 100000, SHA-256) → AES-256 密钥
  → AES-GCM(key, random_iv, plaintext) → 密文
  → salt(16B) + iv(12B) + 密文 → Base64 编码 → 输出

解密流程：
Base64 密文
  → 解码 → 提取 salt(前16B) + iv(16-28B) + 密文(28B后)
  → PBKDF2(password, salt, 100000, SHA-256) → AES-256 密钥
  → AES-GCM-Decrypt(key, iv, 密文) → 明文
```

**安全参数：**

| 参数 | 值 | 说明 |
|------|------|------|
| 加密算法 | AES-256-GCM | 认证加密，防篡改 |
| 密钥派生 | PBKDF2 | 防暴力破解 |
| 迭代次数 | 100,000 | OWASP 推荐值 |
| 哈希算法 | SHA-256 | 密钥派生哈希 |
| Salt 长度 | 16 字节 | 随机生成 |
| IV 长度 | 12 字节 | GCM 推荐 |

### 10.2 密码强度检测

`getPasswordStrength` 函数基于多维度评分：

| 维度 | 分值 |
|------|------|
| 长度 ≥ 8 | +1 |
| 长度 ≥ 12 | +1 |
| 大小写混合 | +1 |
| 包含数字 | +1 |
| 包含特殊字符 | +1 |

评分映射：0=Very Weak, 1=Weak, 2=Fair, 3=Strong, 4=Very Strong

### 10.3 XSS 防护

- **DOMPurify** — Markdown 转 HTML 时使用 DOMPurify 对输出进行消毒，防止 XSS 注入
- **React 内置防护** — JSX 自动转义，防止模板注入
- **Content Security** — 不使用 `dangerouslySetInnerHTML`（除经 DOMPurify 处理的内容外）
- **rel="noopener noreferrer"** — 外部链接添加安全属性

### 10.4 数据不离开浏览器

- 无任何网络请求发送用户数据
- 所有转换在浏览器端完成
- 加密密钥仅存在于内存中，页面关闭即销毁
- 首页、页脚和每个转换器页面均展示隐私提示

---

## 附录：项目目录结构

```
format-forge/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── manifest.json
├── src/
│   ├── app/
│   │   └── page.tsx
│   ├── assets/
│   ├── components/
│   │   ├── converter/
│   │   ├── home/
│   │   ├── layout/
│   │   └── ui/
│   ├── converters/
│   │   ├── base64/
│   │   ├── color/
│   │   ├── crypto/
│   │   ├── hex-viewer/
│   │   ├── json-csv/
│   │   ├── json-formatter/
│   │   ├── jwt/
│   │   ├── markdown/
│   │   ├── timestamp/
│   │   ├── url/
│   │   ├── xml-json/
│   │   └── yaml-json/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   │   └── converters/
│   ├── store/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   ├── architecture.md
│   └── contributing.md
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```
