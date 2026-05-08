import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { Result } from '@/types';

export function xmlToJson(xml: string): Result<string> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(xml).length;

  if (!xml || !xml.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '输入的 XML 字符串为空' },
    };
  }

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      processEntities: false,
      htmlEntities: false,
      isArray: (name) => {
        void name;
        return false;
      },
    });

    const parsed = parser.parse(xml);
    const jsonOutput = JSON.stringify(parsed, null, 2);
    const outputSize = new TextEncoder().encode(jsonOutput).length;

    return {
      success: true,
      data: jsonOutput,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'XML_PARSE_ERROR',
        message: 'XML 解析失败',
        details: e instanceof Error ? e.message : '无效的 XML',
      },
    };
  }
}

export function jsonToXml(json: string): Result<string> {
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

    if (typeof parsed !== 'object' || parsed === null) {
      return {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'JSON 必须是对象才能转换为 XML',
        },
      };
    }

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      format: true,
      indentBy: '  ',
    });

    const xmlOutput = builder.build(parsed);
    const outputSize = new TextEncoder().encode(xmlOutput).length;

    return {
      success: true,
      data: xmlOutput,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : '未知错误';

    if (msg.includes('JSON')) {
      return {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'JSON 解析失败',
          details: msg,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'XML_BUILD_ERROR',
        message: 'JSON 转 XML 失败',
        details: msg,
      },
    };
  }
}
