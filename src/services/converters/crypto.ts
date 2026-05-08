import type { Result } from '@/types';

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptText(
  plaintext: string,
  password: string
): Promise<Result<string>> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(plaintext).length;

  if (!plaintext) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '明文为空' },
    };
  }

  if (!password) {
    return {
      success: false,
      error: { code: 'EMPTY_PASSWORD', message: '加密需要密码' },
    };
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encoder = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encoder.encode(plaintext) as BufferSource
    );

    const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(ciphertext).length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    const encoded = arrayBufferToBase64(combined.buffer as ArrayBuffer);
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
        code: 'ENCRYPTION_ERROR',
        message: '加密失败',
        details: e instanceof Error ? e.message : '未知错误',
      },
    };
  }
}

export async function decryptText(
  ciphertext: string,
  password: string
): Promise<Result<string>> {
  const start = performance.now();
  const inputSize = new TextEncoder().encode(ciphertext).length;

  if (!ciphertext || !ciphertext.trim()) {
    return {
      success: false,
      error: { code: 'EMPTY_INPUT', message: '密文为空' },
    };
  }

  if (!password) {
    return {
      success: false,
      error: { code: 'EMPTY_PASSWORD', message: '解密需要密码' },
    };
  }

  try {
    const combined = new Uint8Array(base64ToArrayBuffer(ciphertext.trim()));

    if (combined.length < 29) {
      return {
        success: false,
        error: { code: 'INVALID_CIPHERTEXT', message: '密文长度不足，无法解密' },
      };
    }

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      data as BufferSource
    );

    const decoder = new TextDecoder();
    const plaintext = decoder.decode(decrypted);
    const outputSize = new TextEncoder().encode(plaintext).length;

    return {
      success: true,
      data: plaintext,
      meta: { processingTime: performance.now() - start, inputSize, outputSize },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'DECRYPTION_ERROR',
        message: '解密失败',
        details:
          e instanceof Error
            ? e.message.includes('decrypt')
              ? '密码错误或密文已损坏'
              : e.message
            : '未知错误',
      },
    };
  }
}

export function getPasswordStrength(
  password: string
): { score: number; label: string } {
  if (!password) return { score: 0, label: '空' };

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  score = Math.min(score, 4);

  const labels = ['非常弱', '弱', '一般', '强', '非常强'];

  return { score, label: labels[score] };
}
