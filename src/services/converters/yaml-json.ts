import yaml from 'js-yaml';
import type { Result } from '@/types';

export function yamlToJson(yamlInput: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(yamlInput).length;

  if (!yamlInput || !yamlInput.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 YAML 字符串为空' },
    };
  }

  try {
    const parsed = yaml.load(yamlInput, { schema: yaml.JSON_SCHEMA });

    if (parsed === undefined || parsed === null) {
      return {
        success: false,
        error: { code: 'EMPTY_YAML', message: 'YAML 内容为空' },
      };
    }

    const jsonOutput = JSON.stringify(parsed, null, 2);
    const outputSize = new TextEncoder().encode(jsonOutput).length;

    return {
      success: true,
      data: jsonOutput,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : '无效的 YAML';
    const lineMatch = msg.match(/line\s+(\d+)/i);
    const colMatch = msg.match(/column\s+(\d+)/i);

    return {
      success: false,
      error: {
        code: 'YAML_PARSE_ERROR',
        message: 'YAML 解析失败',
        details: msg,
        line: lineMatch ? parseInt(lineMatch[1]) : undefined,
        column: colMatch ? parseInt(colMatch[1]) : undefined,
      },
    };
  }
}

export function jsonToYaml(json: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(json).length;

  if (!json || !json.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 JSON 字符串为空' },
    };
  }

  try {
    const parsed = JSON.parse(json);
    const yamlOutput = yaml.dump(parsed, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });
    const outputSize = new TextEncoder().encode(yamlOutput).length;

    return {
      success: true,
      data: yamlOutput,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : '无效的 JSON';

    if (msg.includes('JSON')) {
      const posMatch = msg.match(/position\s+(\d+)/i);
      let line: number | undefined;
      let column: number | undefined;

      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const beforeError = json.substring(0, pos);
        const lines = beforeError.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      return {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'JSON 解析失败',
          details: msg,
          line,
          column,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'YAML_DUMP_ERROR',
        message: 'JSON 转 YAML 失败',
        details: msg,
      },
    };
  }
}
