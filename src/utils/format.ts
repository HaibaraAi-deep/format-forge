export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
