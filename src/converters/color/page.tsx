import { useState, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { Button } from '@/components/ui/button';
import { parseColor, colorToHex, colorToRgb, colorToHsl, colorToRgba, colorToHsla } from '@/services/converters/color';
import type { Color } from '@/services/converters/color';
import { useClipboard } from '@/hooks/use-clipboard';
import { useDebounce } from '@/hooks/useDebounce';
import { Copy, Check, Palette } from 'lucide-react';

const COMMON_COLORS: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
];

interface FormatRowProps {
  label: string;
  value: string;
}

function FormatRow({ label, value }: FormatRowProps) {
  const { copied, copy } = useClipboard();

  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-[var(--muted-foreground)] shrink-0 w-10">{label}</span>
        <span className="text-sm font-mono text-[var(--foreground)] truncate">{value}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copy(value)}
        className="h-7 shrink-0 gap-1 text-xs"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[var(--success)]" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? '已复制' : '复制'}
      </Button>
    </div>
  );
}

export default function ColorPage() {
  const [input, setInput] = useState('#3B82F6');

  const debouncedInput = useDebounce(input, 200);

  const conversionResult = useMemo(() => {
    if (!debouncedInput.trim()) {
      return { color: null as Color | null, error: null as string | null };
    }

    const result = parseColor(debouncedInput);
    if (result.success) {
      return { color: result.data, error: null };
    }
    return { color: null, error: result.error.message };
  }, [debouncedInput]);

  const color = conversionResult.color;
  const error = conversionResult.error;

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setInput(hex);
  };

  const handlePaletteClick = (hex: string) => {
    setInput(hex);
  };

  const formats = color
    ? [
        { label: 'HEX', value: colorToHex(color) },
        { label: 'RGB', value: colorToRgb(color) },
        { label: 'HSL', value: colorToHsl(color) },
        { label: 'RGBA', value: colorToRgba(color) },
        { label: 'HSLA', value: colorToHsla(color) },
      ]
    : [];

  return (
    <ConverterLayout
      title="颜色格式转换器"
      description="在 HEX、RGB、HSL、RGBA、HSLA 等颜色格式之间自由转换，支持实时预览和调色板快速选取"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">颜色输入</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入颜色值，如 #3B82F6, rgb(59,130,246), hsl(217,91%,60%)"
                className="h-9 flex-1 rounded-[var(--radius)] border border-[var(--input)] bg-transparent px-3 text-sm font-mono text-[var(--foreground)]"
              />
              <input
                type="color"
                value={color ? colorToHex(color) : '#3B82F6'}
                onChange={handleColorPickerChange}
                className="h-9 w-12 cursor-pointer rounded-[var(--radius)] border border-[var(--input)] bg-transparent p-0.5"
              />
            </div>
          </div>

          <div
            className="h-32 rounded-[var(--radius)] border border-[var(--border)] transition-colors"
            style={{ backgroundColor: color ? colorToRgba(color) : 'transparent' }}
          />

          {error && <ErrorDisplay error={error} />}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[var(--muted-foreground)]" />
              <label className="text-sm font-medium text-[var(--foreground)]">所有格式</label>
            </div>
            {formats.length > 0 ? (
              <div className="space-y-2">
                {formats.map((fmt) => (
                  <FormatRow key={fmt.label} label={fmt.label} value={fmt.value} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">输入颜色值后将显示所有等效格式</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">常用颜色</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => handlePaletteClick(c.hex)}
              className="group flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-2.5 py-1.5 transition-colors hover:border-[var(--primary)]/40"
            >
              <span
                className="h-4 w-4 rounded-full border border-[var(--border)] shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-xs text-[var(--foreground)]">{c.name}</span>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">{c.hex}</span>
            </button>
          ))}
        </div>
      </div>
    </ConverterLayout>
  );
}
