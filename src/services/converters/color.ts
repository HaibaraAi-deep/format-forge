import type { Result } from '@/types';

export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  rgba: { r: number; g: number; b: number; a: number };
  hsla: { h: number; s: number; l: number; a: number };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === rn) {
    h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  } else if (max === gn) {
    h = ((bn - rn) / d + 2) / 6;
  } else {
    h = ((rn - gn) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = h / 360;

  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

export function parseColor(input: string): Result<Color> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(input).length;

  if (!input || !input.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: 'Color input is empty' },
    };
  }

  const trimmed = input.trim().toLowerCase();

  let r: number, g: number, b: number, a = 1;

  const hexMatch = trimmed.match(/^#?([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 4) {
      a = parseInt(hex[3] + hex[3], 16) / 255;
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 8) {
      a = parseInt(hex.slice(6, 8), 16) / 255;
      hex = hex.slice(0, 6);
    }
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return {
        success: false,
        error: { code: 'INVALID_HEX', message: 'Invalid hex color format' },
      };
    }
  } else {
    const rgbaMatch = trimmed.match(
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/
    );
    if (rgbaMatch) {
      r = parseInt(rgbaMatch[1]);
      g = parseInt(rgbaMatch[2]);
      b = parseInt(rgbaMatch[3]);
      a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    } else {
      const hslaMatch = trimmed.match(
        /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*(?:,\s*([\d.]+)\s*)?\)$/
      );
      if (hslaMatch) {
        const h = parseInt(hslaMatch[1]);
        const s = parseInt(hslaMatch[2]);
        const l = parseInt(hslaMatch[3]);
        a = hslaMatch[4] !== undefined ? parseFloat(hslaMatch[4]) : 1;
        const rgb = hslToRgb(h, s, l);
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
      } else {
        return {
          success: false,
          error: {
            code: 'INVALID_COLOR',
            message: 'Unrecognized color format',
            details: 'Supported formats: #hex, rgb(), rgba(), hsl(), hsla()',
          },
        };
      }
    }
  }

  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);
  a = clamp(a, 0, 1);

  const hsl = rgbToHsl(r, g, b);
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  const color: Color = {
    hex,
    rgb: { r, g, b },
    hsl,
    rgba: { r, g, b, a },
    hsla: { ...hsl, a },
  };

  const outputSize = new TextEncoder().encode(JSON.stringify(color)).length;

  return {
    success: true,
    data: color,
    meta: { processingTime: performance.now() - start, inputSize, outputSize },
  };
}

export function colorToHex(color: Color): string {
  return color.hex;
}

export function colorToRgb(color: Color): string {
  return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
}

export function colorToHsl(color: Color): string {
  return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
}

export function colorToRgba(color: Color): string {
  return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
}

export function colorToHsla(color: Color): string {
  return `hsla(${color.hsla.h}, ${color.hsla.s}%, ${color.hsla.l}%, ${color.hsla.a})`;
}
