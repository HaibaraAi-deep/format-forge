# FormatForge 贡献指南

感谢你对 FormatForge 项目的关注！本文档将帮助你了解如何参与项目开发。

---

## 1. 开发环境搭建

### 前置要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 20.x LTS | 推荐使用 LTS 版本 |
| npm | ≥ 10.x | 随 Node.js 一起安装 |
| Git | ≥ 2.x | 版本控制 |

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/<your-username>/format-forge.git
cd format-forge

# 2. 安装依赖
npm ci

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中打开 http://localhost:5173
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（热更新） |
| `npm run build` | 构建生产版本（TypeScript 编译 + Vite 打包） |
| `npm run preview` | 预览生产构建产物 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run lint:fix` | 运行 ESLint 并自动修复 |
| `npm run type-check` | TypeScript 类型检查（不生成文件） |
| `npm run test` | 运行测试（单次） |
| `npm run test:watch` | 运行测试（监听模式） |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |

---

## 2. 开发流程

### 分支策略

```
main          ← 稳定分支，自动部署到 GitHub Pages
  │
  ├── feature/xxx   ← 功能开发分支
  ├── fix/xxx       ← Bug 修复分支
  ├── refactor/xxx  ← 重构分支
  └── docs/xxx      ← 文档更新分支
```

**规则：**

- 禁止直接向 `main` 分支推送代码
- 所有变更通过 Pull Request 合并
- PR 至少需要一人 Review 通过后方可合并
- 合并到 `main` 后自动触发部署

### 提交规范（Conventional Commits）

项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(converter): add QR code generator` |
| `fix` | Bug 修复 | `fix(base64): handle empty input correctly` |
| `docs` | 文档更新 | `docs: update contributing guide` |
| `style` | 代码格式（不影响逻辑） | `style: fix indentation` |
| `refactor` | 重构（不新增功能、不修复 Bug） | `refactor(hooks): simplify useConverter` |
| `perf` | 性能优化 | `perf(services): optimize JSON parsing` |
| `test` | 测试相关 | `test(crypto): add encryption test cases` |
| `chore` | 构建/工具变更 | `chore: update dependencies` |
| `ci` | CI 配置变更 | `ci: add Node.js 22 to test matrix` |

**Scope 范围：**

- `converter` — 转换器相关
- `services` — 服务层相关
- `hooks` — 自定义 Hooks 相关
- `store` — 状态管理相关
- `ui` — UI 组件相关
- `theme` — 主题相关
- `build` — 构建配置相关

**示例：**

```
feat(converter): add YAML to JSON converter

Implement bidirectional conversion between YAML and JSON formats,
supporting complex nested structures and comments.

Closes #42
```

---

## 3. 代码规范

### ESLint 配置

项目使用以下 ESLint 配置：

- `@eslint/js` 推荐规则
- `typescript-eslint` 推荐规则
- `eslint-plugin-react-hooks` Hooks 规则
- `eslint-plugin-react-refresh` Vite 热更新兼容规则

运行检查：

```bash
npm run lint        # 检查问题
npm run lint:fix    # 自动修复
```

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `ConverterLayout.tsx` |
| 服务文件 | kebab-case | `json-csv.ts` |
| Hook 文件 | camelCase | `useConverter.ts` |
| 工具函数文件 | kebab-case | `file.ts` |
| Store 文件 | kebab-case | `theme-store.ts` |
| CSS 变量 | kebab-case | `--primary-foreground` |
| 组件导出 | Named Export | `export function ConverterLayout()` |
| 页面组件 | Default Export | `export default function Base64Page()` |
| 类型/接口 | PascalCase | `Result<T>`, `ToolInfo` |
| 常量 | UPPER_SNAKE_CASE | `STRENGTH_COLORS` |

### TypeScript 规范

- 严格模式开启，不允许 `any` 类型（特殊情况需注释说明）
- 优先使用 `interface` 定义对象类型，`type` 用于联合类型和工具类型
- 所有公共函数必须有完整的参数和返回值类型标注
- 使用 `import type` 导入纯类型

### 导入顺序

```typescript
// 1. React 相关
import { useState, useEffect } from 'react';

// 2. 第三方库
import { Link } from 'react-router-dom';

// 3. 内部模块（使用 @ 别名）
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import type { Result } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

// 4. 相对路径导入
import { formatByteSize } from './utils';
```

---

## 4. 组件开发指南

### 如何创建新的转换器

以创建一个「Markdown → HTML」转换器为例，完整步骤如下：

#### 第一步：创建服务层函数

在 `src/services/converters/` 下创建新文件：

```typescript
// src/services/converters/markdown.ts
import type { Result } from '@/types';

export function markdownToHtml(input: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入内容为空' },
    };
  }

  try {
    const html = convertMarkdown(input);
    const outputSize = new TextEncoder().encode(html).length;

    return {
      success: true,
      data: html,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Markdown 转换失败',
        details: e instanceof Error ? e.message : 'Unknown error',
      },
    };
  }
}
```

**要点：**

- 返回值必须为 `Result<T>` 类型
- 空输入校验在前
- 使用 `performance.now()` 计算耗时
- 使用 `TextEncoder` 计算字节大小
- 错误信息提供 `code` 和 `message`

#### 第二步：注册服务导出

在 `src/services/index.ts` 中添加导出：

```typescript
export * from './converters/markdown';
```

#### 第三步：创建页面组件

在 `src/converters/` 下创建目录和页面：

```typescript
// src/converters/markdown/page.tsx
import { useState, useEffect } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { OutputPanel } from '@/components/converter/OutputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { markdownToHtml } from '@/services/converters/markdown';
import { useDebounce } from '@/hooks/useDebounce';

export default function MarkdownPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    processingTime?: number;
    inputSize?: number;
    outputSize?: number;
  }>({});

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setOutput('');
      setError(null);
      setStats({});
      return;
    }

    const result = markdownToHtml(debouncedInput);
    if (result.success) {
      setOutput(result.data);
      setError(null);
      setStats({
        processingTime: result.meta?.processingTime,
        inputSize: result.meta?.inputSize,
        outputSize: result.meta?.outputSize,
      });
    } else {
      setOutput('');
      setError(result.error.message);
      setStats({});
    }
  }, [debouncedInput]);

  return (
    <ConverterLayout
      title="Markdown → HTML"
      description="将 Markdown 文本转换为 HTML"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel
          value={input}
          onChange={setInput}
          placeholder="在此输入 Markdown 文本..."
        />
        <OutputPanel
          value={output}
          label="HTML 输出"
          filename="output.html"
          mimeType="text/html"
        />
      </div>

      {error && <ErrorDisplay error={error} />}
      <ConversionStats
        processingTime={stats.processingTime}
        inputSize={stats.inputSize}
        outputSize={stats.outputSize}
      />
    </ConverterLayout>
  );
}
```

#### 第四步：注册路由

在 `src/App.tsx` 中添加懒加载路由：

```typescript
const MarkdownPage = lazy(() => import('@/converters/markdown/page'));

// 在 <Routes> 中添加：
<Route path="/markdown" element={<MarkdownPage />} />
```

#### 第五步：注册首页工具卡片

在 `src/app/page.tsx` 的 `tools` 数组中添加：

```typescript
{
  id: 'markdown',
  name: 'Markdown → HTML',
  description: 'Markdown 实时预览与 HTML 导出，支持 GFM 语法',
  category: 'text',
  icon: 'file-text',
  path: '/markdown',
  keywords: ['markdown', 'html', '预览', '转换', 'gfm'],
}
```

#### 第六步：编写测试

在 `src/services/converters/__tests__/` 下创建测试文件：

```typescript
import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../markdown';

describe('markdownToHtml', () => {
  it('should convert markdown to html', () => {
    const result = markdownToHtml('# Hello');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toContain('Hello');
    }
  });

  it('should return error for empty input', () => {
    const result = markdownToHtml('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('EMPTY_INPUT');
    }
  });
});
```

### 转换器页面模板

对于支持双向转换的转换器（如编码/解码），参考以下模式：

```typescript
type Mode = 'encode' | 'decode';

export default function XxxPage() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ processingTime?: number; inputSize?: number; outputSize?: number }>({});

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setOutput('');
      setError(null);
      setStats({});
      return;
    }

    const result = mode === 'encode'
      ? encodeFn(debouncedInput)
      : decodeFn(debouncedInput);

    if (result.success) {
      setOutput(result.data);
      setError(null);
      setStats({ ... });
    } else {
      setOutput('');
      setError(result.error.message);
      setStats({});
    }
  }, [debouncedInput, mode]);

  const handleModeSwitch = () => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
    setInput('');
    setOutput('');
    setError(null);
    setStats({});
  };

  return (
    <ConverterLayout title="..." description="...">
      {/* 模式切换按钮 */}
      <div className="flex items-center gap-3">...</div>

      {/* 输入输出区 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel value={input} onChange={setInput} />
        <OutputPanel value={output} />
      </div>

      {error && <ErrorDisplay error={error} />}
      <ConversionStats {...stats} />
    </ConverterLayout>
  );
}
```

---

## 5. 测试规范

### 测试框架

- **Vitest** — 单元测试运行器，兼容 Jest API
- **@testing-library/react** — React 组件测试
- **@testing-library/user-event** — 用户交互模拟
- **jsdom** — 浏览器环境模拟

### 测试文件组织

```
src/
├── services/
│   └── converters/
│       └── __tests__/
│           ├── base64.test.ts
│           ├── crypto.test.ts
│           └── ...
├── hooks/
│   └── __tests__/
│       ├── useConverter.test.ts
│       └── ...
└── utils/
    └── __tests__/
        ├── validation.test.ts
        └── ...
```

### 测试要求

| 类型 | 要求 | 说明 |
|------|------|------|
| 服务层 | **必须覆盖** | 所有转换函数需有完整测试 |
| 工具函数 | **必须覆盖** | 校验、格式化等纯函数需有测试 |
| Hooks | 建议覆盖 | 核心逻辑 Hook 需有测试 |
| 组件 | 建议覆盖 | 关键交互流程需有测试 |

### 覆盖率目标

| 模块 | 目标覆盖率 |
|------|-----------|
| `services/` | ≥ 90% |
| `utils/` | ≥ 80% |
| `hooks/` | ≥ 70% |
| 整体 | ≥ 75% |

### 测试编写规范

```typescript
import { describe, it, expect } from 'vitest';

describe('模块名称', () => {
  describe('函数名称', () => {
    it('should 正常行为描述', () => {
      // Arrange - 准备
      const input = '...';

      // Act - 执行
      const result = convertFn(input);

      // Assert - 断言
      expect(result.success).toBe(true);
    });

    it('should handle edge case', () => {
      const result = convertFn('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });
  });
});
```

**要点：**

- 使用 `describe` + `it` 组织测试结构
- 测试描述使用 `should + 行为` 格式
- Result 类型断言前先窄化类型（`if (result.success)`）
- 测试正常路径和异常路径
- 测试边界条件（空输入、超大输入、特殊字符等）

---

## 6. PR 提交规范

### PR 模板

```markdown
## 变更类型

- [ ] feat: 新功能
- [ ] fix: Bug 修复
- [ ] refactor: 重构
- [ ] docs: 文档更新
- [ ] test: 测试
- [ ] chore: 构建/工具

## 变更说明

<!-- 简要描述本次变更的内容和原因 -->

## 关联 Issue

<!-- Closes #xxx -->

## 测试

- [ ] 已添加/更新单元测试
- [ ] 所有测试通过 (`npm run test`)
- [ ] Lint 检查通过 (`npm run lint`)
- [ ] 类型检查通过 (`npm run type-check`)
- [ ] 构建成功 (`npm run build`)

## 截图（如适用）

<!-- UI 变更请附截图 -->
```

### Review 流程

1. **提交 PR** — 确保所有检查通过
2. **自动检查** — CI 运行 lint、type-check、build
3. **代码 Review** — 至少一人 Review 通过
4. **合并** — Squash and Merge 到 main
5. **自动部署** — 合并后自动部署到 GitHub Pages

### PR 检查清单

提交 PR 前请确认：

- [ ] 代码通过 `npm run lint` 检查
- [ ] 代码通过 `npm run type-check` 类型检查
- [ ] 代码通过 `npm run build` 构建
- [ ] 新功能有对应的测试用例
- [ ] 所有测试通过 `npm run test`
- [ ] 提交信息符合 Conventional Commits 规范
- [ ] 如有 UI 变更，附截图说明

---

## 7. 发布流程

### 版本号规范

项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

```
MAJOR.MINOR.PATCH

MAJOR — 不兼容的 API 变更
MINOR — 向后兼容的功能新增
PATCH — 向后兼容的 Bug 修复
```

### 发布步骤

1. **确认 main 分支状态** — 所有 CI 检查通过，无未合并 PR
2. **更新版本号** — 修改 `package.json` 中的 `version` 字段
3. **更新 Changelog** — 在 `CHANGELOG.md` 中记录变更
4. **创建 Tag** — `git tag v<version>`
5. **推送 Tag** — `git push origin v<version>`
6. **自动部署** — 推送到 main 后自动触发部署

### Changelog 格式

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 格式：

```markdown
# Changelog

## [1.1.0] - 2026-05-06

### Added
- 新增 JWT 解析转换器
- 新增二进制查看器

### Fixed
- 修复 Base64 解码时 Unicode 字符处理错误
- 修复暗色主题下滚动条颜色不明显

### Changed
- 优化 JSON 格式化的性能
- 更新依赖版本

## [1.0.0] - 2026-04-01

### Added
- 初始版本发布
- 支持 12 种格式转换工具
```

---

## 常见问题

### Q: 开发服务器启动失败？

确认 Node.js 版本 ≥ 20，删除 `node_modules` 后重新 `npm ci`。

### Q: 如何调试转换函数？

转换函数为纯函数，可以独立导入测试。在测试文件中直接导入 service 函数即可调试，无需启动开发服务器。

### Q: 如何添加新的第三方依赖？

1. 评估依赖的必要性和体积影响
2. 安装依赖：`npm install <package>`
3. 如果是开发依赖：`npm install -D <package>`
4. 如果依赖需要在构建产物中单独 chunk，在 `vite.config.ts` 的 `manualChunks` 中配置
5. 在 PR 中说明添加依赖的原因

### Q: 如何处理异步转换函数？

参考 `crypto.ts` 的实现，异步函数返回 `Promise<Result<T>>`，在页面组件中使用 `async/await` 处理，并管理 `isConverting` 加载状态。
