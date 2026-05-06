import { useState, useEffect } from 'react';
import { ConverterLayout } from '@/components/converter/ConverterLayout';
import { InputPanel } from '@/components/converter/InputPanel';
import { OutputPanel } from '@/components/converter/OutputPanel';
import { ErrorDisplay } from '@/components/converter/ErrorDisplay';
import { ConversionStats } from '@/components/converter/ConversionStats';
import { Button } from '@/components/ui/button';
import { encryptText, decryptText, getPasswordStrength } from '@/services/converters/crypto';
import { useDebounce } from '@/hooks/useDebounce';
import type { Result } from '@/types';
import { ArrowRightLeft, Lock, Unlock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

type Mode = 'encrypt' | 'decrypt';

const STRENGTH_COLORS: Record<string, string> = {
  'Very Weak': 'bg-red-500',
  Weak: 'bg-orange-500',
  Fair: 'bg-yellow-500',
  Strong: 'bg-green-500',
  'Very Strong': 'bg-emerald-500',
};

const STRENGTH_TEXT_COLORS: Record<string, string> = {
  'Very Weak': 'text-red-500',
  Weak: 'text-orange-500',
  Fair: 'text-yellow-500',
  Strong: 'text-green-500',
  'Very Strong': 'text-emerald-500',
};

export default function CryptoPage() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [stats, setStats] = useState<{ processingTime?: number; inputSize?: number; outputSize?: number }>({});

  const debouncedInput = useDebounce(input, 300);
  const debouncedPassword = useDebounce(password, 300);

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    if (!debouncedInput.trim() || !debouncedPassword) {
      setOutput('');
      setError(null);
      setStats({});
      return;
    }

    const runConversion = async () => {
      setIsConverting(true);
      setError(null);

      try {
        let result: Result<string>;
        if (mode === 'encrypt') {
          result = await encryptText(debouncedInput, debouncedPassword);
        } else {
          result = await decryptText(debouncedInput, debouncedPassword);
        }

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
      } catch {
        setError('转换过程中发生未知错误');
        setOutput('');
        setStats({});
      } finally {
        setIsConverting(false);
      }
    };

    runConversion();
  }, [debouncedInput, debouncedPassword, mode]);

  const handleModeSwitch = () => {
    setMode((prev) => (prev === 'encrypt' ? 'decrypt' : 'encrypt'));
    setInput('');
    setOutput('');
    setError(null);
    setStats({});
  };

  return (
    <ConverterLayout
      title="AES-GCM 加密/解密"
      description="使用 AES-256-GCM 算法对文本进行加密和解密，所有操作均在浏览器本地完成"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => mode !== 'encrypt' && handleModeSwitch()}
          className={`flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'encrypt'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80'
          }`}
        >
          <Lock className="h-4 w-4" />
          加密 (Encrypt)
        </button>
        <button
          onClick={() => mode !== 'decrypt' && handleModeSwitch()}
          className={`flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'decrypt'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80'
          }`}
        >
          <Unlock className="h-4 w-4" />
          解密 (Decrypt)
        </button>
        <Button variant="ghost" size="sm" onClick={handleModeSwitch} className="ml-auto">
          <ArrowRightLeft className="h-4 w-4" />
          切换
        </Button>
      </div>

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--foreground)] shrink-0">密码</label>
          <div className="relative flex-1 max-w-sm">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入加密/解密密码"
              className="h-8 w-full rounded-[var(--radius)] border border-[var(--input)] bg-transparent px-3 pr-9 text-sm text-[var(--foreground)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mode === 'encrypt' && password && (
          <div className="space-y-1.5">
            <div className="flex h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-[var(--muted)]">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-full flex-1 transition-colors ${
                    i <= passwordStrength.score
                      ? STRENGTH_COLORS[passwordStrength.label]
                      : 'bg-transparent'
                  } ${i > 0 ? 'ml-0.5' : ''}`}
                />
              ))}
            </div>
            <p className={`text-xs ${STRENGTH_TEXT_COLORS[passwordStrength.label]}`}>
              密码强度: {passwordStrength.label}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-[var(--radius)] border border-yellow-500/30 bg-yellow-500/5 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          请妥善保管您的密码。如果忘记密码，将无法恢复加密内容。所有加密操作均在浏览器本地完成，密码不会被发送到任何服务器。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPanel
          value={input}
          onChange={setInput}
          placeholder={mode === 'encrypt' ? '在此输入要加密的明文...' : '在此输入要解密的密文 (Base64)...'}
        />
        <OutputPanel
          value={output}
          label={mode === 'encrypt' ? '加密结果' : '解密结果'}
          filename={mode === 'encrypt' ? 'encrypted.txt' : 'decrypted.txt'}
          mimeType="text/plain"
        />
      </div>

      {isConverting && (
        <p className="text-xs text-[var(--muted-foreground)]">正在处理中...</p>
      )}

      {error && <ErrorDisplay error={error} />}

      <ConversionStats
        processingTime={stats.processingTime}
        inputSize={stats.inputSize}
        outputSize={stats.outputSize}
      />
    </ConverterLayout>
  );
}
