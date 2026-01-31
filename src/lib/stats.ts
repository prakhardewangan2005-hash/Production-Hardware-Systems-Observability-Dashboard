export function p95(values: number[]): number {
  if (values.length === 0) return 0;
  const arr = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(0.95 * arr.length) - 1;
  return arr[Math.max(0, Math.min(arr.length - 1, idx))];
}
