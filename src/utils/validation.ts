export function isValidJson(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

export function isValidBase64(input: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(input) && input.length % 4 === 0;
}

export function isValidHexColor(input: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(input);
}

export function isValidJwt(input: string): boolean {
  const parts = input.split('.');
  return parts.length === 3;
}
